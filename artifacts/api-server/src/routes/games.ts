import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { store } from "../services/store";
import { generateFocusBossLLM, generateThoughtMonsterLLM, isGeminiConfigured } from "../services/llm";

const router: IRouter = Router();

router.post("/games/thought-monster/start", async (req, res) => {
  try {
    const { message, distortion, absolutist_words, memory_results } = req.body as {
      message: string;
      analysis_id?: string;
      emotion?: string;
      distortion?: string;
      absolutist_words?: string[];
      memory_results?: Array<{ id: string; title: string; summary: string; trigger: string; reframe: string }>;
    };

    if (!message?.trim()) {
      res.status(400).json({ error: "message is required" });
      return;
    }

    if (!isGeminiConfigured()) {
      res.status(503).json({ error: "Gemini API is not configured. Set GEMINI_API_KEY on the API server." });
      return;
    }

    const gameId = "game_" + randomUUID().slice(0, 8);
    const detectedDistortion = distortion ?? "overgeneralization";
    const words = absolutist_words ?? [];
    const llmResult = await generateThoughtMonsterLLM(message, detectedDistortion, words);

    if (!llmResult) {
      res.status(502).json({ error: "Gemini could not create this thought challenge." });
      return;
    }

    const memoryProof = memory_results?.length
      ? {
          id: memory_results[0].id,
          title: memory_results[0].title,
          summary: memory_results[0].summary,
          reframe: memory_results[0].reframe,
        }
      : null;

    store.gameEvents.add({
      user_id: "demo_user",
      game_type: "thought_monster",
      status: "started",
      data: { game_id: gameId, distortion: detectedDistortion, message },
    });

    res.json({
      game_id: gameId,
      monster_name: llmResult.monster_name,
      trigger_words: words,
      distortion: detectedDistortion,
      weakness: llmResult.weakness,
      guide: "Nova",
      cbt_question_1: llmResult.cbt_question_1,
      cbt_question_2: llmResult.cbt_question_2,
      cbt_question_3: llmResult.cbt_question_3,
      memory_proof: memoryProof,
      recommended_next_action: llmResult.recommended_next_action,
      safe_reframe: llmResult.safe_reframe,
    });
  } catch (err) {
    req.log.error({ err }, "thought-monster/start failed");
    res.status(500).json({ error: "Failed to start game" });
  }
});

router.post("/games/thought-monster/complete", (req, res) => {
  try {
    const { game_id, original_thought, final_reframe, distortion, character } = req.body as {
      game_id: string;
      original_thought: string;
      final_reframe: string;
      distortion?: string;
      character?: string;
    };

    const tp = store.thoughtPairs.add({
      user_id: "demo_user",
      original_thought,
      reframe: final_reframe,
      distortion: distortion ?? "overgeneralization",
      trigger: "thought_monster_game",
      character: character ?? "Nova",
    });

    store.memories.add({
      user_id: "demo_user",
      memory_type: "thought_pair",
      title: "Reframe: " + final_reframe.slice(0, 50),
      summary: `Original thought reframed and stored.`,
      content: `Original thought: ${original_thought}\nReframe: ${final_reframe}`,
      emotion: "recovery",
      trigger: "thought_monster_game",
      distortion: distortion ?? "overgeneralization",
      reframe: final_reframe,
      character: character ?? "Nova",
      intervention: "thought_monster_battle",
      importance: 8,
    });

    store.gameEvents.add({
      user_id: "demo_user",
      game_type: "thought_monster",
      status: "completed",
      data: { game_id, thought_pair_id: tp.id },
    });

    res.json({
      success: true,
      reward: "Reality Sword unlocked. Reframe stored in Memory Core.",
      memory_id: tp.id,
      graph_updated: true,
    });
  } catch (err) {
    req.log.error({ err }, "thought-monster/complete failed");
    res.status(500).json({ error: "Failed to complete game" });
  }
});

router.post("/games/focus-boss/create", async (req, res) => {
  try {
    const { goal, linked_thought, estimated_minutes } = req.body as {
      goal: string;
      linked_thought?: string;
      camera_objects?: string[];
      estimated_minutes?: number;
    };

    if (!goal?.trim()) {
      res.status(400).json({ error: "goal is required" });
      return;
    }

    if (!isGeminiConfigured()) {
      res.status(503).json({ error: "Gemini API is not configured. Set GEMINI_API_KEY on the API server." });
      return;
    }

    const bossId = "boss_" + randomUUID().slice(0, 8);
    const estMinutes = estimated_minutes ?? 25;
    const llmResult = await generateFocusBossLLM(goal, linked_thought ?? "");

    if (!llmResult?.battle_plan?.length) {
      res.status(502).json({ error: "Gemini could not create this focus plan." });
      return;
    }

    store.gameEvents.add({
      user_id: "demo_user",
      game_type: "focus_boss",
      status: "created",
      data: { boss_id: bossId, goal, boss_name: llmResult.boss_name },
    });

    res.json({
      boss_id: bossId,
      boss_name: llmResult.boss_name,
      main_task: goal,
      tiny_step: llmResult.battle_plan[0]?.action ?? goal,
      estimated_time_minutes: estMinutes,
      battle_plan: llmResult.battle_plan,
      character: "Arlo",
      arlo_message: llmResult.arlo_message,
    });
  } catch (err) {
    req.log.error({ err }, "focus-boss/create failed");
    res.status(500).json({ error: "Failed to create focus boss" });
  }
});

export default router;
