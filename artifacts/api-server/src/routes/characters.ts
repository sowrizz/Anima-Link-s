import { Router, type IRouter } from "express";
import { isGeminiConfigured, routeCharactersLLM } from "../services/llm";

const router: IRouter = Router();

const CHARACTER_RESPONSES: Record<string, { role: string; messages: string[] }> = {
  Sera: {
    role: "Empathic Mirror",
    messages: [
      "That sounds really heavy. I'm here with you.",
      "I hear how much weight you're carrying right now.",
      "Your feelings make sense given what you're going through.",
    ],
  },
  Kael: {
    role: "Grounding Force",
    messages: [
      "Let's pause. Take one breath. Then one small step.",
      "Before we solve anything, let's get grounded. Feel your feet on the floor.",
      "Overwhelm is just too many thoughts at once. Let's sort them one at a time.",
    ],
  },
  Nova: {
    role: "CBT Challenger",
    messages: [
      "Let's test that thought. What's the actual evidence?",
      "I caught a distortion in that sentence. Ready to challenge it?",
      "That sounds like overgeneralization. Let's look at what's really true.",
    ],
  },
  Zen: {
    role: "Mindful Guide",
    messages: [
      "You don't have to fix this thought. Just observe it passing.",
      "This feeling is real, but it's not permanent. Let it move through.",
      "One breath. One moment. That's all we need right now.",
    ],
  },
  Arlo: {
    role: "Action Motivator",
    messages: [
      "You don't need to finish everything. Just start one thing.",
      "What's the smallest action you can take in the next 2 minutes?",
      "Let's turn this into a mission. Ready to take the first step?",
    ],
  },
};

function getCharacterMessage(name: string): string {
  const char = CHARACTER_RESPONSES[name];
  if (!char) return "I'm here to support you.";
  const msgs = char.messages;
  return msgs[Math.floor(Math.random() * msgs.length)];
}

router.post("/characters/route", async (req, res) => {
  try {
    const { analysis, user_preference } = req.body as {
      analysis: {
        msi_score?: number;
        msi_label?: string;
        distortion?: string;
        emotion?: string;
        intent?: string;
        recommended_path?: string[];
      };
      memory_results?: unknown[];
      user_preference?: string;
    };

    const msiScore = analysis?.msi_score ?? 40;
    const distortion = analysis?.distortion ?? "none";
    const emotion = analysis?.emotion ?? "calm";
    const presetPath = analysis?.recommended_path;

    let recommendedPath: string[];
    let reason: string;

    if (presetPath && presetPath.length > 0) {
      recommendedPath = presetPath;
      reason = "Based on your current emotional state and thought pattern analysis.";
    } else if (user_preference === "challenge_me") {
      recommendedPath = ["Nova", "Arlo"];
      reason = "You asked to be challenged — Nova will test the thought, Arlo will drive action.";
    } else if (user_preference === "calm_me") {
      recommendedPath = ["Kael", "Zen", "Sera"];
      reason = "Calming first, then acceptance, then emotional processing.";
    } else if (msiScore >= 75) {
      recommendedPath = ["Kael", "Nova", "Arlo"];
      reason = "High strain detected — grounding first, then thought challenge, then action.";
    } else if (distortion !== "none") {
      recommendedPath = ["Nova", "Arlo"];
      reason = "Cognitive distortion detected — CBT challenge followed by action steps.";
    } else if (emotion === "low_energy") {
      recommendedPath = ["Sera", "Arlo"];
      reason = "Low energy — validation first, then gentle activation.";
    } else if (emotion === "overwhelm") {
      recommendedPath = ["Zen", "Kael"];
      reason = "Overwhelm — mindful slowing first, then grounding.";
    } else {
      recommendedPath = ["Sera", "Nova"];
      reason = "Starting with empathy, moving to gentle insight.";
    }

    const primaryCharacter = recommendedPath[0];

    const characterResponses = recommendedPath.map((name) => ({
      name,
      role: CHARACTER_RESPONSES[name]?.role ?? "Companion",
      message: getCharacterMessage(name),
      reason: `${name} is recommended for ${distortion !== "none" ? "cognitive reframing" : "emotional support"}.`,
    }));

    if (!isGeminiConfigured()) {
      res.status(503).json({ error: "Gemini API is not configured. Set GEMINI_API_KEY on the API server." });
      return;
    }

    const llmResult = await routeCharactersLLM(analysis, user_preference);
    if (!llmResult?.recommended_path?.length || !llmResult.character_responses?.length) {
      res.status(502).json({ error: "Gemini could not route companion characters." });
      return;
    }

    res.json(llmResult);
  } catch (err) {
    req.log.error({ err }, "characters/route failed");
    res.status(500).json({ error: "Character routing failed" });
  }
});

export default router;
