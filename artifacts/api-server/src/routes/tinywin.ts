import { Router, type IRouter } from "express";
import { store } from "../services/store";

const router: IRouter = Router();

const REWARDS = [
  "Tiny Win Crystal unlocked. This proof is stored against the thought that you never finish.",
  "Progress Gem earned. One more piece of evidence that you can do hard things.",
  "Focus Stone collected. Your consistent action defeats the Never-Finish Beast.",
  "Victory Shard stored. Real proof in your Memory Core.",
  "Breakthrough Badge unlocked. The thought map has been updated.",
];

router.post("/tiny-win/store", (req, res) => {
  try {
    const { proof_type, completed_action, linked_thought, counter_evidence, character } = req.body as {
      proof_type: string;
      completed_action: string;
      linked_thought?: string;
      counter_evidence?: string;
      character?: string;
    };

    if (!proof_type || !completed_action) {
      res.status(400).json({ error: "proof_type and completed_action are required" });
      return;
    }

    const tw = store.tinyWins.add({
      user_id: "demo_user",
      proof_type,
      completed_action,
      linked_thought: linked_thought ?? "",
      counter_evidence: counter_evidence ?? completed_action,
      character: character ?? "Arlo",
    });

    store.memories.add({
      user_id: "demo_user",
      memory_type: "tiny_win",
      title: "Win: " + completed_action.slice(0, 50),
      summary: `Completed: ${completed_action}. Counter-evidence to: ${linked_thought ?? "distorted thought"}.`,
      content: `Tiny win recorded. Action: ${completed_action}. Proof type: ${proof_type}.`,
      emotion: "recovery",
      trigger: "achievement",
      distortion: "none",
      reframe: `I did complete this: ${completed_action}`,
      character: character ?? "Arlo",
      intervention: "tiny_win_proof",
      importance: 9,
    });

    const reward = REWARDS[Math.floor(Math.random() * REWARDS.length)];

    res.json({
      id: tw.id,
      artifact: proof_type,
      reward_message: reward,
      graph_updated: true,
      memory_id: tw.id,
    });
  } catch (err) {
    req.log.error({ err }, "tiny-win/store failed");
    res.status(500).json({ error: "Failed to store tiny win" });
  }
});

export default router;
