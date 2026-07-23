/**
 * Project Jannah v6.1 - 43v3r.SDK
 * AI Platform Gateway: Strict 8-Stage Execution Pipeline
 */

import { GoogleGenAI } from "@google/genai";
import { getDb } from "../../server/db.js";

export interface AIGatewayConfig {
  apiKey?: string;
  defaultModel?: string;
}

export interface AIPipelineResult<T = any> {
  intent: string;
  rawResponse: string;
  structuredOutput: T;
  validationSuccess: boolean;
  pipelineDurationMs: number;
}

export class AIGateway {
  private readonly _ai: GoogleGenAI | null = null;
  private readonly _defaultModel: string;

  constructor(config: AIGatewayConfig = {}) {
    const key = config.apiKey || process.env.GEMINI_API_KEY;
    this._defaultModel = config.defaultModel || "gemini-2.5-flash";
    if (key) {
      try {
        this._ai = new GoogleGenAI({ apiKey: key });
        console.log(`[AI GATEWAY] Successfully initialized SDK with model: ${this._defaultModel}`);
      } catch (err: any) {
        console.error("[AI GATEWAY] Failed to initialize Google GenAI SDK:", err.message);
      }
    } else {
      console.info("[AI GATEWAY] External Gemini capability unavailable; deterministic local capability enabled.");
    }
  }

  /**
   * The Canonical 8-Stage Pipeline Entrypoint
   */
  public async executePipeline<T = any>(
    userInput: string,
    options: { systemInstruction?: string; jsonSchema?: any; category?: string } = {}
  ): Promise<AIPipelineResult<T>> {
    const startTime = Date.now();
    console.log(`[AI GATEWAY] [START] Processing request: "${userInput.substring(0, 45)}..."`);

    // Stage 1: Intent Detection
    const intent = await this.detectIntent(userInput);

    // Stage 2: Memory Retrieval
    const memory = await this.retrieveMemory(intent, options.category);

    // Stage 3: Prompt Builder
    const prompt = this.buildPrompt(userInput, intent, memory, options.systemInstruction);

    // Stage 4: Model Router & Stage 5: Tool Execution (Optional) & Stage 6: Validation & Stage 7: Structured Output
    let rawResponse = "";
    let structuredOutput: any = null;
    let validationSuccess = false;

    if (this._ai) {
      try {
        const config: any = {};
        if (options.jsonSchema) {
          config.responseMimeType = "application/json";
          config.responseSchema = options.jsonSchema;
        }

        const res = await this._ai.models.generateContent({
          model: this._defaultModel,
          contents: prompt,
          config: config
        });

        rawResponse = res.text || "{}";

        if (options.jsonSchema) {
          structuredOutput = JSON.parse(rawResponse);
          validationSuccess = this.validateOutput(structuredOutput, options.jsonSchema);
        } else {
          structuredOutput = { text: rawResponse };
          validationSuccess = true;
        }
      } catch (err: any) {
        console.error("[AI GATEWAY] Stage 4 Router failure, applying fallback parser:", err.message);
        rawResponse = `{"error": "${err.message}"}`;
        structuredOutput = { text: "Fallback result triggered due to processing error." };
      }
    } else {
      // Deterministic local capability. It reports availability honestly and
      // never fabricates scores, forecasts, or completed analysis.
      rawResponse = this.generateLocalUnavailableResponse(intent);
      try {
        structuredOutput = JSON.parse(rawResponse);
        validationSuccess = true;
      } catch {
        structuredOutput = { text: rawResponse };
        validationSuccess = true;
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[AI GATEWAY] [COMPLETE] Pipeline resolved in ${duration}ms | Intent: "${intent}"`);

    return {
      intent,
      rawResponse,
      structuredOutput: structuredOutput as T,
      validationSuccess,
      pipelineDurationMs: duration
    };
  }

  // --- Pipeline Stages ---

  // Stage 1: Intent Detection
  private async detectIntent(input: string): Promise<string> {
    const text = input.toLowerCase();
    if (text.includes("analyse") || text.includes("analyze") || text.includes("calculate") || text.includes("score")) {
      return "Strategic_Alignment_Evaluation";
    }
    if (text.includes("risk") || text.includes("threat") || text.includes("warning")) {
      return "Risk_Profile_Analysis";
    }
    if (text.includes("roadmap") || text.includes("milestone") || text.includes("forecast")) {
      return "Timeline_Projection";
    }
    return "General_Consultation";
  }

  // Stage 2: Memory Retrieval
  private async retrieveMemory(intent: string, category?: string): Promise<string> {
    try {
      const db = getDb();
      // Fetch similar items or system settings for context matching
      const relatedGoals = db.goals?.slice(0, 2).map(g => `Goal: ${g.title} (${g.progress}% Complete)`).join("\n") || "";
      const scoreState = JSON.stringify(db.scores || {});
      return `[Tenant Scores Context: ${scoreState}]\n[Existing Goals:\n${relatedGoals}]`;
    } catch {
      return "No database memory loaded.";
    }
  }

  // Stage 3: Prompt Builder
  private buildPrompt(input: string, intent: string, memory: string, customInstruction?: string): string {
    return `
[SYSTEM CONTEXT: PROJECT JANNAH INTEGRATION ENGINE]
${customInstruction || "Provide rigorous strategic evaluation matching executive standard."}

[Stage 1 Intent Classified]: ${intent}
[Stage 2 Long-term Memory Hydrated]: 
${memory}

[User Task Parameter]: 
"${input}"

Return a highly structured response adhering perfectly to requested formats.
`;
  }

  // Stage 6: Validation
  private validateOutput(output: any, schema: any): boolean {
    if (!schema) return true;
    // Standard property presence checks
    if (schema.properties) {
      for (const key of Object.keys(schema.properties)) {
        if (schema.required && schema.required.includes(key) && (output[key] === undefined || output[key] === null)) {
          console.warn(`[AI GATEWAY] Validation error: Missing required property: "${key}"`);
          return false;
        }
      }
    }
    return true;
  }

  private generateLocalUnavailableResponse(intent: string): string {
    return JSON.stringify({
      text: "External model capability is unavailable. No AI-derived result was generated.",
      intent,
      capability: "deterministic-local",
      providerAvailable: false
    });
  }
}

export const aiGateway = new AIGateway();
export default aiGateway;
