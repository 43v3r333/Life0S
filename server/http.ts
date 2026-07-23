import type { ErrorRequestHandler, RequestHandler } from "express";

export const normalizeErrorResponses: RequestHandler = (_req, res, next) => {
  const sendJson = res.json.bind(res);
  res.json = ((body: any) => {
    if (res.statusCode >= 400 && typeof body?.error === "string") {
      const { error, ...rest } = body;
      return sendJson({ ...rest, error: { code: res.statusCode === 404 ? "NOT_FOUND" : res.statusCode === 409 ? "CONFLICT" : res.statusCode === 401 ? "UNAUTHORIZED" : res.statusCode === 403 ? "FORBIDDEN" : res.statusCode === 429 ? "RATE_LIMITED" : res.statusCode >= 500 ? "SERVICE_UNAVAILABLE" : "VALIDATION_FAILED", message: error, fieldErrors: [] } });
    }
    return sendJson(body);
  }) as typeof res.json;
  next();
};

export const requireJsonObject: RequestHandler = (req, res, next) => {
  if (!["POST", "PUT", "PATCH"].includes(req.method)) return next();
  // A number of command-style endpoints intentionally have no request body.
  // Validate bodies that are present without breaking those safe commands.
  if (req.body === undefined && !req.headers["content-type"]) return next();
  if (req.body === null || Array.isArray(req.body) || typeof req.body !== "object") return res.status(400).json({ error: { code: "INVALID_REQUEST", message: "A JSON object request body is required.", details: [] } });
  next();
};

export const apiErrorHandler: ErrorRequestHandler = (error: any, req, res, _next) => {
  console.error(`[API ERROR] ${req.method} ${req.path}`, error?.message || error);
  if (res.headersSent) return;
  res.status(Number(error?.status) || 500).json({ error: { code: String(error?.code || "INTERNAL_ERROR"), message: String(error?.message || "The request could not be completed."), fieldErrors: Array.isArray(error?.fieldErrors) ? error.fieldErrors : [], details: Array.isArray(error?.details) ? error.details : [], ...(error?.recovery ? { recovery: String(error.recovery) } : {}) } });
};
