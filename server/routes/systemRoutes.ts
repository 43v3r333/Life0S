import { Router } from "express";

type Dependencies = {
  status: () => Record<string, any>;
  migrate: () => Promise<Record<string, any>>;
  verify: () => Record<string, any>;
  integrity: () => Promise<Record<string, any>>;
  audit: (limit: number) => Record<string, any>;
};

export function createSystemRouter(dependencies: Dependencies) {
  const router = Router();
  router.get("/storage-status", (_req, res) => res.json(dependencies.status()));
  router.post("/storage-migrate", async (_req, res, next) => { try { res.json(await dependencies.migrate()); } catch (error) { next(error); } });
  router.post("/storage-verify", (_req, res, next) => { try { const result = dependencies.verify(); res.status(result.ok ? 200 : 409).json(result); } catch (error) { next(error); } });
  router.get("/integrity", async (_req, res, next) => { try { const result = await dependencies.integrity(); res.status(result.ok ? 200 : 409).json(result); } catch (error) { next(error); } });
  router.get("/audit", (req, res, next) => { try { res.json(dependencies.audit(Math.max(1, Math.min(500, Number(req.query.limit) || 100)))); } catch (error) { next(error); } });
  router.get("/ping", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));
  return router;
}
