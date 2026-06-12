import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { store } from "../services/store";
import { generateFocusBossLLM, generateThoughtMonsterLLM, gradeCBTArenaLLM, isGeminiConfigured } from "../services/llm";

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

    const gameId = "game_" + randomUUID().slice(0, 8);
    const detectedDistortion = distortion ?? "overgeneralization";
    const words = absolutist_words ?? [];

    let llmResult = null;
    if (isGeminiConfigured()) {
      try {
        llmResult = await generateThoughtMonsterLLM(message, detectedDistortion, words);
      } catch {
        llmResult = null;
      }
    }

    const monsterNames: Record<string, string> = {
      overgeneralization: "Always-Never Hydra",
      catastrophizing: "Doom Volcano",
      "all-or-nothing": "Binary Specter",
      "fortune-telling": "Oracle of Despair",
      magnification: "Amplifier Giant",
    };

    const finalMonsterName = llmResult?.monster_name ?? (monsterNames[detectedDistortion] ?? "Distortion Shadow");
    const finalWeakness = llmResult?.weakness ?? "Evidence Checking & Cognitive Reframing";
    const finalQ1 = llmResult?.cbt_question_1 ?? "Is this thought 100% true in every single situation?";
    const finalQ2 = llmResult?.cbt_question_2 ?? "What is the concrete, objective evidence against this thought?";
    const finalQ3 = llmResult?.cbt_question_3 ?? "How would a supportive friend view this situation?";
    const finalReframe = llmResult?.safe_reframe ?? "This feels challenging right now, but I can handle it step by step.";
    const finalNextAction = llmResult?.recommended_next_action ?? "Identify the very next tiny action you can control.";

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
      monster_name: finalMonsterName,
      trigger_words: words,
      distortion: detectedDistortion,
      weakness: finalWeakness,
      guide: "Nova",
      cbt_question_1: finalQ1,
      cbt_question_2: finalQ2,
      cbt_question_3: finalQ3,
      memory_proof: memoryProof,
      recommended_next_action: finalNextAction,
      safe_reframe: finalReframe,
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

    const bossId = "boss_" + randomUUID().slice(0, 8);
    const estMinutes = estimated_minutes ?? 25;

    let llmResult = null;
    if (isGeminiConfigured()) {
      try {
        llmResult = await generateFocusBossLLM(goal, linked_thought ?? "");
      } catch {
        llmResult = null;
      }
    }

    const finalBossName = llmResult?.boss_name ?? "Overwhelm Titan";
    const finalArloMessage = llmResult?.arlo_message ?? "Let's defeat this procrastination beast. We will break it down into small, bite-sized actions.";
    const finalBattlePlan = llmResult?.battle_plan?.length
      ? llmResult.battle_plan
      : [
          { step: 1, action: "Clear your desk and close unrelated browser tabs", duration_minutes: 5 },
          { step: 2, action: "Spend 10 minutes working on the first tiny piece of the goal", duration_minutes: 10 },
          { step: 3, action: "Review what you've done and plan the next block", duration_minutes: 5 },
          { step: 4, action: "Take a quick water break", duration_minutes: 3 },
          { step: 5, action: "Celebrate starting! Write down this win.", duration_minutes: 2 },
        ];

    store.gameEvents.add({
      user_id: "demo_user",
      game_type: "focus_boss",
      status: "created",
      data: { boss_id: bossId, goal, boss_name: finalBossName },
    });

    res.json({
      boss_id: bossId,
      boss_name: finalBossName,
      main_task: goal,
      tiny_step: finalBattlePlan[0]?.action ?? goal,
      estimated_time_minutes: estMinutes,
      battle_plan: finalBattlePlan,
      character: "Arlo",
      arlo_message: finalArloMessage,
    });
  } catch (err) {
    req.log.error({ err }, "focus-boss/create failed");
    res.status(500).json({ error: "Failed to create focus boss" });
  }
});

router.post("/games/cbt-arena/score", async (req, res) => {
  try {
    const { scenario, original_reply } = req.body as {
      scenario: string;
      original_reply: string;
    };

    if (!scenario?.trim() || !original_reply?.trim()) {
      res.status(400).json({ error: "scenario and original_reply are required" });
      return;
    }

    let scoreResult = null;
    if (isGeminiConfigured()) {
      try {
        scoreResult = await gradeCBTArenaLLM(scenario, original_reply);
      } catch (err) {
        req.log.warn({ err }, "gradeCBTArenaLLM failed, falling back");
      }
    }

    if (!scoreResult) {
      const isAggressive = /lazy|always|never|useless|ruin|hate|blame|fault|bad|worst|ignore/i.test(original_reply);
      const isShort = original_reply.length < 15;

      scoreResult = {
        aggression: isAggressive ? "high" : "low" as const,
        clarity: isShort ? "low" : "high" as const,
        solution_focus: isShort || isAggressive ? "low" : "high" as const,
        distortion_pattern: scenario.toLowerCase().includes("deadline") ? "Overgeneralization" : "Catastrophizing",
        guidance: isAggressive
          ? "Your response contains emotionally charged words. Try to focus on the objective situation rather than placing blame."
          : "Good start. Focus on communicating clearly and asking for a resolution.",
        improved_suggestion: scenario.toLowerCase().includes("deadline")
          ? "Hi, just wanted to check if there are any blockers with the code push. Let me know how I can support you so we make the deadline."
          : "It's okay to make mistakes sometimes. I will double check the email templates next time to make sure they are correct."
      };
    }

    const gameId = "cbt_" + randomUUID().slice(0, 8);

    store.gameEvents.add({
      user_id: "demo_user",
      game_type: "cbt_arena",
      status: "completed",
      data: { game_id: gameId, scenario, original_reply, score: scoreResult },
    });

    res.json({
      game_id: gameId,
      ...scoreResult,
    });
  } catch (err) {
    req.log.error({ err }, "cbt-arena/score failed");
    res.status(500).json({ error: "Failed to grade CBT arena response" });
  }
});

router.post("/games/cbt-arena/complete", (req, res) => {
  try {
    const { game_id, scenario, final_reframe, distortion } = req.body as {
      game_id: string;
      scenario: string;
      final_reframe: string;
      distortion?: string;
    };

    const tp = store.thoughtPairs.add({
      user_id: "demo_user",
      original_thought: scenario,
      reframe: final_reframe,
      distortion: distortion ?? "overgeneralization",
      trigger: "cbt_arena_game",
      character: "Nova",
    });

    store.memories.add({
      user_id: "demo_user",
      memory_type: "thought_pair",
      title: "Reframe: " + final_reframe.slice(0, 50),
      summary: `Scenario response reframed and stored.`,
      content: `Scenario: ${scenario}\nReframe: ${final_reframe}`,
      emotion: "recovery",
      trigger: "cbt_arena_game",
      distortion: distortion ?? "overgeneralization",
      reframe: final_reframe,
      character: "Nova",
      intervention: "cbt_arena_practice",
      importance: 8,
    });

    res.json({
      success: true,
      reward: "Response mastery unlocked. Reframe stored in Memory Core.",
      memory_id: tp.id,
      graph_updated: true,
    });
  } catch (err) {
    req.log.error({ err }, "cbt-arena/complete failed");
    res.status(500).json({ error: "Failed to complete CBT arena game" });
  }
});

export default router;
