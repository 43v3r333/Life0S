import fs from "fs/promises";
import path from "path";
import { GoogleGenAI } from "@google/genai";

const DATA_DIR = path.join(process.cwd(), "data");
const QDRANT_FILE = path.join(DATA_DIR, "qdrant.json");

export interface QdrantPoint {
  id: string;
  vector: number[];
  payload: Record<string, any>;
}

class QdrantSimulator {
  private points: QdrantPoint[] = [];
  private writePromise: Promise<void> = Promise.resolve();

  constructor() {
    this.init();
  }

  private async init() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      try {
        const content = await fs.readFile(QDRANT_FILE, "utf-8");
        this.points = JSON.parse(content);
        console.log(`[QDRANT] Loaded ${this.points.length} dense vector points from ${QDRANT_FILE}`);
      } catch (err) {
        this.points = [];
        await this.save();
        console.log(`[QDRANT] Created new vector storage index at ${QDRANT_FILE}`);
      }
    } catch (err) {
      console.error("[QDRANT] Failed to initialize vector storage on disk:", err);
    }
  }

  private async save() {
    this.writePromise = this.writePromise.then(async () => {
      try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.writeFile(QDRANT_FILE, JSON.stringify(this.points, null, 2), "utf-8");
      } catch (err) {
        console.error("[QDRANT] Failed to write dense vectors to disk:", err);
      }
    });
    await this.writePromise;
  }

  /**
   * Helper to generate a text-similarity-equivalent pseudo-embedding vector of 1536 dimensions.
   * If an active Gemini API key is configured, it will use real Google embeddings!
   */
  public async getEmbeddings(text: string, geminiKey?: string): Promise<number[]> {
    const defaultDims = 1536;
    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const res: any = await ai.models.embedContent({
          model: "text-embedding-004",
          contents: text,
        });
        const embeddingValues = res.embedding?.values || res.embeddings?.[0]?.values;
        if (embeddingValues) {
          console.log(`[Qdrant SDK] Successfully generated genuine Google embedding vector for: "${text.substring(0, 30)}..."`);
          return embeddingValues;
        }
      } catch (err: any) {
        console.warn(`[Qdrant SDK] Failed to fetch live Google embeddings: ${err.message}. Cascading to local projection vectors.`);
      }
    }

    // High fidelity, reproducible mock vector based on string hash and char values
    const vector = new Array(defaultDims).fill(0);
    const cleaned = text.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    // Hash terms and spread values across the 1536 dimensions
    for (let i = 0; i < cleaned.length; i++) {
      const charCode = cleaned.charCodeAt(i);
      const dimensionIndex = (charCode * (i + 1) * 31) % defaultDims;
      vector[dimensionIndex] = (vector[dimensionIndex] || 0) + (charCode / 128);
    }

    // Normalize the vector
    let magnitude = 0;
    for (let i = 0; i < defaultDims; i++) {
      magnitude += vector[i] * vector[i];
    }
    magnitude = Math.sqrt(magnitude) || 1;
    for (let i = 0; i < defaultDims; i++) {
      vector[i] = vector[i] / magnitude;
    }

    return vector;
  }

  public async upsertPoint(id: string, vector: number[], payload: Record<string, any>): Promise<void> {
    const index = this.points.findIndex((p) => p.id === id);
    if (index >= 0) {
      this.points[index] = { id, vector, payload };
    } else {
      this.points.push({ id, vector, payload });
    }
    console.log(`[Qdrant SDK] UPSERT point: ${id} | Payload keys: [${Object.keys(payload).join(", ")}]`);
    await this.save();
  }

  public async searchPoints(queryVector: number[], threshold: number = 0.15, limit: number = 5): Promise<any[]> {
    const results = this.points.map((point) => {
      // Calculate Cosine Similarity
      let dotProduct = 0;
      let magA = 0;
      let magB = 0;
      
      const maxLen = Math.max(queryVector.length, point.vector.length);
      for (let i = 0; i < maxLen; i++) {
        const a = queryVector[i] || 0;
        const b = point.vector[i] || 0;
        dotProduct += a * b;
        magA += a * a;
        magB += b * b;
      }

      const cosineSim = dotProduct / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
      return {
        id: point.id,
        score: parseFloat(cosineSim.toFixed(4)),
        payload: point.payload,
      };
    });

    return results
      .filter((r) => r.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  public getPointsCount(): number {
    return this.points.length;
  }
}

export const qdrantStore = new QdrantSimulator();
export default qdrantStore;
