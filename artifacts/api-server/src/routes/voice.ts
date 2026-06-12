import { Router, type IRouter } from "express";

const router: IRouter = Router();

const VOICE_SPELL_ROUTES: Array<{
  patterns: string[];
  route: string;
  action: string;
}> = [
  { patterns: ["battle", "challenge", "fight thought", "monster"], route: "thought_monster", action: "start_thought_monster" },
  { patterns: ["focus", "boss fight", "deadline", "sprint"], route: "focus_boss", action: "start_focus_boss" },
  { patterns: ["camera", "scan", "workspace", "desk"], route: "camera_mission", action: "open_camera" },
  { patterns: ["breathe", "breathing", "calm", "reset"], route: "breathing_reset", action: "start_breathing" },
  { patterns: ["memory", "remember", "recall", "proof"], route: "memory", action: "open_memory" },
  { patterns: ["support", "character", "companion", "council"], route: "support_modes", action: "open_companions" },
  { patterns: ["report", "weekly", "progress", "summary"], route: "report", action: "open_report" },
  { patterns: ["safety", "help", "sos", "crisis"], route: "safety", action: "open_safety" },
  { patterns: ["voice", "talk", "speak", "room"], route: "voice_room", action: "open_voice" },
  { patterns: ["tiny win", "win proof", "proof"], route: "tiny_win", action: "open_tiny_win" },
];

async function transcribeWithOpenAI(audioBase64: string): Promise<string | null> {
  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey || !audioBase64) return null;

  try {
    const audioBuffer = Buffer.from(audioBase64, "base64");
    const formData = new FormData();
    const audioBlob = new Blob([audioBuffer], { type: "audio/m4a" });
    formData.append("file", audioBlob, "audio.m4a");
    formData.append("model", "whisper-1");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    });

    if (!response.ok) return null;
    const data = (await response.json()) as { text: string };
    return data.text ?? null;
  } catch {
    return null;
  }
}

router.post("/voice/transcribe", async (req, res) => {
  try {
    const { audio_base64, typed_fallback } = req.body as {
      audio_base64?: string;
      typed_fallback?: string;
    };

    let transcript: string | null = null;
    let source = "typed";
    let confidence = "certain";

    if (audio_base64 && audio_base64.length > 100) {
      transcript = await transcribeWithOpenAI(audio_base64);
      if (transcript) {
        source = "audio";
        confidence = "likely";
      }
    }

    if (!transcript && typed_fallback) {
      transcript = typed_fallback;
      source = "typed";
      confidence = "certain";
    }

    if (!transcript) {
      transcript = "I am feeling stressed about my work right now.";
      source = "typed";
      confidence = "low";
    }

    res.json({ transcript, source, confidence });
  } catch (err) {
    req.log.error({ err }, "voice/transcribe failed");
    res.json({
      transcript: req.body?.typed_fallback ?? "Could not transcribe.",
      source: "typed",
      confidence: "low",
    });
  }
});

router.post("/voice/route-spell", (req, res) => {
  try {
    const { transcript } = req.body as { transcript: string };

    if (!transcript) {
      res.status(400).json({ error: "transcript is required" });
      return;
    }

    const lower = transcript.toLowerCase();

    for (const spell of VOICE_SPELL_ROUTES) {
      if (spell.patterns.some((p) => lower.includes(p))) {
        res.json({
          route: spell.route,
          action: spell.action,
          params: { transcript },
        });
        return;
      }
    }

    res.json({
      route: "chat",
      action: "send_message",
      params: { transcript, message: transcript },
    });
  } catch (err) {
    req.log.error({ err }, "voice/route-spell failed");
    res.status(500).json({ error: "Routing failed" });
  }
});

export default router;
