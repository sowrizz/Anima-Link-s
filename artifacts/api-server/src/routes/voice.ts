import { Router, type IRouter } from "express";
import { isGeminiConfigured, routeVoiceLLM, transcribeAudioLLM } from "../services/llm";

const router: IRouter = Router();

router.post("/voice/transcribe", async (req, res) => {
  try {
    const { audio_base64, audio_mime_type, typed_fallback } = req.body as {
      audio_base64?: string;
      audio_mime_type?: string;
      typed_fallback?: string;
    };

    if (audio_base64 && audio_base64.length > 100) {
      if (!isGeminiConfigured()) {
        res.status(503).json({ error: "Gemini API is not configured. Set GEMINI_API_KEY on the API server." });
        return;
      }

      const transcript = await transcribeAudioLLM(audio_base64, audio_mime_type ?? "audio/m4a");
      if (!transcript) {
        res.status(502).json({ error: "Gemini could not transcribe the audio." });
        return;
      }

      res.json({ transcript, source: "gemini_audio", confidence: "likely" });
      return;
    }

    if (typed_fallback?.trim()) {
      res.json({ transcript: typed_fallback.trim(), source: "typed", confidence: "certain" });
      return;
    }

    res.status(400).json({ error: "audio_base64 or typed_fallback is required" });
  } catch (err) {
    req.log.error({ err }, "voice/transcribe failed");
    res.status(500).json({ error: "Voice transcription failed" });
  }
});

router.post("/voice/route-spell", async (req, res) => {
  try {
    const { transcript } = req.body as { transcript: string };

    if (!transcript) {
      res.status(400).json({ error: "transcript is required" });
      return;
    }

    if (!isGeminiConfigured()) {
      res.status(503).json({ error: "Gemini API is not configured. Set GEMINI_API_KEY on the API server." });
      return;
    }

    const route = await routeVoiceLLM(transcript);
    if (!route) {
      res.status(502).json({ error: "Gemini could not route this voice command." });
      return;
    }

    res.json({
      route: route.route,
      action: route.action,
      params: { transcript, ...(route.params ?? {}) },
    });
  } catch (err) {
    req.log.error({ err }, "voice/route-spell failed");
    res.status(500).json({ error: "Routing failed" });
  }
});

export default router;
