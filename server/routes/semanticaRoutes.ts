import { Router } from "express";
import { semanticaService } from "../services/semantica.ts";

type Dependencies = {
  getState: () => Record<string, any>;
};

export function createSemanticaRouter(getState: () => Record<string, any>) {
  const router = Router();

  // Extract triples from text
  router.post("/extract", async (req, res, next) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          error: {
            code: "INVALID_REQUEST",
            message: "Text is required and must be a string"
          }
        });
      }

      const triples = await semanticaService.extractTriples(text);
      res.json({
        triples,
        count: triples.length,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  });

  // Search knowledge graph
  router.get("/search", async (req, res, next) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          error: {
            code: "INVALID_REQUEST",
            message: "Query parameter 'q' is required and must be a string"
          }
        });
      }

      const results = await semanticaService.searchKnowledge(q);
      res.json({
        query: q,
        results,
        count: results.length,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  });

  // Add a triple to the knowledge graph
  router.post("/triples", async (req, res, next) => {
    try {
      const { subject, predicate, object } = req.body;

      if (!subject || !predicate || !object ||
          typeof subject !== 'string' ||
          typeof predicate !== 'string' ||
          typeof object !== 'string') {
        return res.status(400).json({
          error: {
            code: "INVALID_REQUEST",
            message: "Subject, predicate, and object are required and must be strings"
          }
        });
      }

      const added = await semanticaService.addTriple(subject, predicate, object);
      res.json({
        added,
        triple: { subject, predicate, object },
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  });

  // Get knowledge graph statistics
  router.get("/stats", async (_req, res, next) => {
    try {
      const stats = await semanticaService.getStats();
      res.json({
        ...stats,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  });

  // Health check endpoint
  router.get("/health", async (_req, res) => {
    res.json({
      status: semanticaService.isInitialized ? 'ready' : 'initializing',
      service: 'semantica',
      timestamp: new Date().toISOString()
    });
  });

  return router;
}