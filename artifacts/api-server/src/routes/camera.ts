import { Router, type IRouter } from "express";
import { analyzeWorkspaceImageLLM, isGeminiConfigured } from "../services/llm";

const router: IRouter = Router();

router.post("/camera/analyze-workspace", async (req, res) => {
  try {
    const { image_base64, mime_type } = req.body as {
      image_base64?: string;
      mime_type?: string;
      mode?: string;
    };

    if (!image_base64 || image_base64.length < 100) {
      res.status(400).json({ error: "A real camera or gallery image is required." });
      return;
    }

    if (!isGeminiConfigured()) {
      res.status(503).json({ error: "Gemini API is not configured. Set GEMINI_API_KEY on the API server." });
      return;
    }

    const result = await analyzeWorkspaceImageLLM(image_base64, mime_type ?? "image/jpeg");
    if (!result) {
      res.status(502).json({ error: "Gemini could not analyze this image. Try a clearer workspace photo." });
      return;
    }

    res.json({
      objects: Array.isArray(result.objects) ? result.objects : [],
      workspace_state: result.workspace_state ?? "workspace",
      suggested_mission: result.suggested_mission ?? "Pick one visible object and use it as an anchor for a 2-minute reset.",
      focus_score: Math.max(0, Math.min(100, Number(result.focus_score) || 0)),
      source: "gemini_vision",
    });
  } catch (err) {
    req.log.error({ err }, "camera/analyze-workspace failed");
    res.status(500).json({ error: "Workspace analysis failed" });
  }
});

export default router;
