import { Router, type IRouter } from "express";

const router: IRouter = Router();

const HIGH_RISK_PHRASES = [
  "suicide",
  "kill myself",
  "end my life",
  "want to die",
  "self harm",
  "hurt myself",
  "cutting",
  "overdose",
  "not worth living",
  "no reason to live",
];

const CRISIS_RESOURCES = [
  "iCall (India): 9152987821",
  "Vandrevala Foundation: 1860-2662-345 (24/7)",
  "AASRA: 9820466627",
  "Vandrevala Foundation Chat: iCall.psychologicalhealth.in",
  "Crisis Text Line: Text HOME to 741741 (USA)",
  "Samaritans (UK): 116 123",
];

const MEDIUM_RISK_RESOURCES = [
  "Anima Support Mode: Sera (emotional validation)",
  "Guided Breathing: Available in Missions tab",
  "iCall (India): 9152987821",
];

router.post("/safety/check", (req, res) => {
  try {
    const { message } = req.body as { message: string; user_id?: string };

    if (!message) {
      res.status(400).json({ error: "message is required" });
      return;
    }

    const lower = message.toLowerCase();

    const isHighRisk = HIGH_RISK_PHRASES.some((phrase) => lower.includes(phrase));
    const isMediumRisk =
      !isHighRisk &&
      (lower.includes("hopeless") ||
        lower.includes("worthless") ||
        lower.includes("nothing matters") ||
        lower.includes("disappear") ||
        lower.includes("give up"));

    if (isHighRisk) {
      res.json({
        safe: false,
        risk_level: "high",
        route: "crisis_support",
        message:
          "You are not alone. What you are feeling matters. Anima cannot replace professional support right now — please reach out to a crisis line. You deserve real human support.",
        resources: CRISIS_RESOURCES,
      });
      return;
    }

    if (isMediumRisk) {
      res.json({
        safe: false,
        risk_level: "medium",
        route: "emotional_support",
        message:
          "That sounds really heavy. Anima is here. Let Sera hold space with you for a moment. If you feel unsafe at any point, please reach out to a crisis line.",
        resources: MEDIUM_RISK_RESOURCES,
      });
      return;
    }

    res.json({
      safe: true,
      risk_level: "low",
      route: "continue",
      message: "Anima is here with you. Let's work through this together.",
      resources: [],
    });
  } catch (err) {
    req.log.error({ err }, "safety/check failed");
    res.json({
      safe: false,
      risk_level: "unknown",
      route: "crisis_support",
      message: "Something went wrong. If you need immediate support, please contact a crisis line.",
      resources: CRISIS_RESOURCES,
    });
  }
});

export default router;
