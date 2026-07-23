import { Router } from "express";
import { buildCodebaseGuide } from "../codebaseService.js";

export function createBusinessRouter(getState: () => Record<string, any>, root: string) {
  const router = Router();
  router.get("/codebase", async (_req, res, next) => { try { res.json(await buildCodebaseGuide(root, getState())); } catch (error) { next(error); } });
  return router;
}
