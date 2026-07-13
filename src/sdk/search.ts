/**
 * Project Jannah v6.1 - 43v3r.SDK
 * Unified Enterprise Search Layer: Semantic, Keyword, and Hybrid Fusion Search
 */

import { qdrantStore } from "../../server/qdrant.js";
import { getDb } from "../../server/db.js";

export interface SearchResult {
  id: string;
  score: number; // 0.0 to 1.0 representing confidence or relevance
  source: string;
  payload: Record<string, any>;
  matchType: "semantic" | "keyword" | "hybrid";
}

export class SearchEngine {
  /**
   * Semantic Vector Search (Powered by Qdrant dense models)
   */
  public async semanticSearch(query: string, limit: number = 5): Promise<SearchResult[]> {
    console.log(`[SEARCH ENGINE] [SEMANTIC] Query: "${query}"`);
    try {
      const queryVector = await qdrantStore.getEmbeddings(query);
      const points = await qdrantStore.searchPoints(queryVector, 0.1, limit * 2);
      
      return points.map(pt => ({
        id: pt.id,
        score: pt.score,
        source: pt.payload?.collection || "generic",
        payload: pt.payload,
        matchType: "semantic"
      }));
    } catch (err: any) {
      console.error("[SEARCH ENGINE] Semantic search exception, failing back:", err.message);
      return [];
    }
  }

  /**
   * Keyword Text-Matching Search (Regex / Word Match)
   */
  public async keywordSearch(query: string, limit: number = 5): Promise<SearchResult[]> {
    console.log(`[SEARCH ENGINE] [KEYWORD] Query: "${query}"`);
    const db = getDb();
    const queryLower = query.toLowerCase();
    const terms = queryLower.split(/\s+/).filter(t => t.length > 2);
    const results: SearchResult[] = [];

    if (terms.length === 0 && queryLower.length > 0) {
      terms.push(queryLower);
    }

    // Search Goals
    if (db.goals) {
      for (const g of db.goals) {
        let matches = 0;
        const textToSearch = `${g.title} ${g.smartDefinition} ${g.okrObjective} ${g.purpose || ""} ${(g.tags || []).join(" ")}`.toLowerCase();
        for (const term of terms) {
          if (textToSearch.includes(term)) matches++;
        }
        if (matches > 0) {
          results.push({
            id: g.id,
            score: parseFloat((matches / terms.length).toFixed(2)),
            source: "goals",
            payload: g,
            matchType: "keyword"
          });
        }
      }
    }

    // Search Knowledge Objects
    if (db.knowledgeObjects) {
      for (const ko of db.knowledgeObjects) {
        let matches = 0;
        const textToSearch = `${ko.title} ${ko.summary} ${ko.description} ${(ko.tags || []).join(" ")}`.toLowerCase();
        for (const term of terms) {
          if (textToSearch.includes(term)) matches++;
        }
        if (matches > 0) {
          results.push({
            id: ko.id,
            score: parseFloat((matches / terms.length).toFixed(2)),
            source: "knowledge",
            payload: ko,
            matchType: "keyword"
          });
        }
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Hybrid Search (RRF - Reciprocal Rank Fusion blending Keyword & Semantic Vectors)
   */
  public async hybridSearch(query: string, limit: number = 5): Promise<SearchResult[]> {
    console.log(`[SEARCH ENGINE] [HYBRID] Invoking hybrid reciprocal rank fusion for query: "${query}"`);
    
    const [semanticResults, keywordResults] = await Promise.all([
      this.semanticSearch(query, limit * 2),
      this.keywordSearch(query, limit * 2)
    ]);

    const blendedMap = new Map<string, SearchResult>();

    // Merge semantic results
    for (const r of semanticResults) {
      blendedMap.set(r.id, r);
    }

    // Merge keyword results, adjusting scores for records that match both (boosting confidence!)
    for (const r of keywordResults) {
      const existing = blendedMap.get(r.id);
      if (existing) {
        // Boost score if found in both
        existing.score = Math.min(1.0, parseFloat((existing.score * 0.7 + r.score * 0.3 + 0.1).toFixed(4)));
        existing.matchType = "hybrid";
      } else {
        blendedMap.set(r.id, r);
      }
    }

    return Array.from(blendedMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Query-Specific Subroutines
   */
  public async relatedGoals(goalId: string, limit: number = 3): Promise<SearchResult[]> {
    const db = getDb();
    const currentGoal = db.goals?.find(g => g.id === goalId);
    if (!currentGoal) return [];

    // Search using tags and category names
    const searchQuery = `${currentGoal.title} ${currentGoal.type} ${(currentGoal.tags || []).join(" ")}`;
    const results = await this.semanticSearch(searchQuery, limit + 1);
    
    // Filter out the goal itself
    return results.filter(r => r.id !== goalId).slice(0, limit);
  }

  public async relatedKnowledge(goalId: string, limit: number = 3): Promise<SearchResult[]> {
    const db = getDb();
    const currentGoal = db.goals?.find(g => g.id === goalId);
    if (!currentGoal) return [];

    const searchQuery = `${currentGoal.title} ${currentGoal.okrObjective}`;
    const results = await this.keywordSearch(searchQuery, limit * 2);
    
    return results.filter(r => r.source === "knowledge").slice(0, limit);
  }

  public async relatedDocuments(docId: string, limit: number = 3): Promise<SearchResult[]> {
    const db = getDb();
    const currentDoc = db.knowledgeObjects?.find(ko => ko.id === docId);
    if (!currentDoc) return [];

    const searchQuery = `${currentDoc.title} ${currentDoc.summary}`;
    return this.semanticSearch(searchQuery, limit);
  }

  public async recommendations(userId: string, limit: number = 3): Promise<SearchResult[]> {
    // Generate intelligent recommendations based on active/inactive progress balances
    const db = getDb();
    const strugglingGoals = db.goals?.filter(g => g.progress < 30 && g.status === "Active") || [];
    
    if (strugglingGoals.length === 0) {
      // Return highest priority goals
      const critical = db.goals?.filter(g => g.priority === "Critical" || g.priority === "High") || [];
      return critical.map(g => ({
        id: g.id,
        score: 0.9,
        source: "goals",
        payload: g,
        matchType: "keyword" as const
      })).slice(0, limit);
    }

    // Recommendation search focused on supporting struggling goals
    const targetQuery = strugglingGoals.map(g => g.title).join(" ");
    return this.hybridSearch(targetQuery, limit);
  }
}

export const searchEngine = new SearchEngine();
export default searchEngine;
