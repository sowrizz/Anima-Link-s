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
      let transcript = null;
      if (isGeminiConfigured()) {
        try {
          transcript = await transcribeAudioLLM(audio_base64, audio_mime_type ?? "audio/m4a");
        } catch {
          transcript = null;
        }
      }

      if (!transcript) {
        // Return a fallback transcript so the voice flow doesn't break
        transcript = typed_fallback?.trim() || "Anima, battle this thought";
        res.json({ transcript, source: "fallback_audio", confidence: "likely" });
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

    let route = null;
    if (isGeminiConfigured()) {
      try {
        route = await routeVoiceLLM(transcript);
      } catch {
        route = null;
      }
    }

    if (route?.route && route?.action) {
      res.json({
        route: route.route,
        action: route.action,
        params: { transcript, ...(route.params ?? {}) },
      });
      return;
    }

    // Local regex voice command router
    const lower = transcript.toLowerCase();
    let routeStr = "chat";
    let actionStr = "send_message";

    if (lower.includes("battle") || lower.includes("distortion") || lower.includes("thought")) {
      routeStr = "thought_monster";
      actionStr = "start_thought_monster";
    } else if (lower.includes("focus") || lower.includes("boss") || lower.includes("timer") || lower.includes("sprint")) {
      routeStr = "focus_boss";
      actionStr = "start_focus_boss";
    } else if (lower.includes("camera") || lower.includes("workspace") || lower.includes("ground")) {
      routeStr = "camera_mission";
      actionStr = "open_camera";
    } else if (lower.includes("breathe") || lower.includes("reset") || lower.includes("relax")) {
      routeStr = "breathing_reset";
      actionStr = "start_breathing";
    } else if (lower.includes("memory") || lower.includes("past")) {
      routeStr = "memory";
      actionStr = "open_memory";
    } else if (lower.includes("companion") || lower.includes("sera") || lower.includes("kael") || lower.includes("nova") || lower.includes("zen") || lower.includes("arlo")) {
      routeStr = "support_modes";
      actionStr = "open_companions";
    } else if (lower.includes("report") || lower.includes("weekly") || lower.includes("summary")) {
      routeStr = "report";
      actionStr = "open_report";
    } else if (lower.includes("safety") || lower.includes("help") || lower.includes("crisis")) {
      routeStr = "safety";
      actionStr = "open_safety";
    } else if (lower.includes("voice") || lower.includes("speak")) {
      routeStr = "voice_room";
      actionStr = "open_voice";
    } else if (lower.includes("win") || lower.includes("tiny") || lower.includes("proof")) {
      routeStr = "tiny_win";
      actionStr = "open_tiny_win";
    }

    res.json({
      route: routeStr,
      action: actionStr,
      params: { transcript },
    });
  } catch (err) {
    req.log.error({ err }, "voice/route-spell failed");
    res.status(500).json({ error: "Routing failed" });
  }
});

export default router;
