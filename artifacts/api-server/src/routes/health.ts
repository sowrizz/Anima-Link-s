import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const llmConfigured = !!process.env["OPENAI_API_KEY"];

  res.json({
    status: "ok",
    backend: "ok",
    llm_configured: llmConfigured,
    sqlite_connected: true,
    chroma_connected: false,
    mode: process.env["NODE_ENV"] ?? "development",
  });
});

export default router;
