import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { store } from "../services/store";
import { generateThoughtMonsterLLM, generateFocusBossLLM } from "../services/llm";

const router: IRouter = Router();

const MONSTER_TEMPLATES: Record<string, {
  monster_name: string;
  weakness: string;
  cbt_question_1: string;
  cbt_question_2: string;
  cbt_question_3: string;
}> = {
  overgeneralization: {
    monster_name: "Never-Finish Beast",
    weakness: "Evidence Check",
    cbt_question_1: "What is the Never-Finish Beast trying to make you believe about yourself?",
    cbt_question_2: "What evidence does NOT fully support the idea that you 'never' or 'always' do this?",
    cbt_question_3: "What would you say to a close friend who had this exact thought?",
  },
  catastrophizing: {
    monster_name: "Catastrophe Shadow",
    weakness: "Reality Anchor",
    cbt_question_1: "What is the worst that could realistically happen?",
    cbt_question_2: "What evidence suggests things are not as catastrophic as the thought claims?",
    cbt_question_3: "If a friend described this situation, what would you tell them?",
  },
  "all-or-nothing": {
    monster_name: "Black-White Phantom",
    weakness: "Spectrum Thinking",
    cbt_question_1: "What is the all-or-nothing thought trying to tell you?",
    cbt_question_2: "Where on the spectrum between 0% and 100% does reality actually fall?",
    cbt_question_3: "Can you think of a time when the outcome was somewhere in the middle?",
  },
  default: {
    monster_name: "Thought Distorter",
    weakness: "Clear Seeing",
    cbt_question_1: "What belief is hiding inside this thought?",
    cbt_question_2: "What does the evidence actually show, separate from how it feels?",
    cbt_question_3: "What would a trusted friend say if you shared this thought?",
  },
};

const REFRAMES: Record<string, string> = {
  overgeneralization: "I do not need to always succeed to be worthwhile. I can start with one small step right now.",
  catastrophizing: "The situation is difficult, but it is survivable. I have gotten through hard things before.",
  "all-or-nothing": "Progress does not need to be perfect. Partial success is still real success.",
  default: "This thought is not a fact. I can look at it with curiosity rather than belief.",
};

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

    const gameId = "game_" + randomUUID().slice(0, 8);
    const detectedDistortion = distortion ?? "overgeneralization";
    const words = absolutist_words ?? [];

    let llmResult = null;
    if (message) {
      try {
        llmResult = await generateThoughtMonsterLLM(message, detectedDistortion, words);
      } catch {
        // use template
      }
    }

    const template = MONSTER_TEMPLATES[detectedDistortion] ?? MONSTER_TEMPLATES["default"];
    const reframe = REFRAMES[detectedDistortion] ?? REFRAMES["default"];

    const memoryProof = memory_results && memory_results.length > 0
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
      monster_name: llmResult?.monster_name ?? template.monster_name,
      trigger_words: words.length > 0 ? words : ["never", "always"],
      distortion: detectedDistortion,
      weakness: llmResult?.weakness ?? template.weakness,
      guide: "Nova",
      cbt_question_1: llmResult?.cbt_question_1 ?? template.cbt_question_1,
      cbt_question_2: llmResult?.cbt_question_2 ?? template.cbt_question_2,
      cbt_question_3: llmResult?.cbt_question_3 ?? template.cbt_question_3,
      memory_proof: memoryProof,
      recommended_next_action: llmResult?.recommended_next_action ?? "Start with one small step in the next 5 minutes.",
      safe_reframe: llmResult?.safe_reframe ?? reframe,
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
      summary: `Original: "${original_thought.slice(0, 60)}..." → Reframe stored.`,
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
    const { goal, linked_thought, camera_objects, estimated_minutes } = req.body as {
      goal: string;
      linked_thought?: string;
      camera_objects?: string[];
      estimated_minutes?: number;
    };

    if (!goal) {
      res.status(400).json({ error: "goal is required" });
      return;
    }

    const bossId = "boss_" + randomUUID().slice(0, 8);
    const estMinutes = estimated_minutes ?? 25;

    let llmResult = null;
    try {
      llmResult = await generateFocusBossLLM(goal, linked_thought ?? "");
    } catch {
      // use template
    }

    const bossName = llmResult?.boss_name ?? "Deadline Demon";
    const arloMessage = llmResult?.arlo_message ?? `Time to fight the ${bossName}. You don't need to finish everything — just start with one section.`;
    const battlePlan = llmResult?.battle_plan ?? [
      { step: 1, action: "Clear your space and put distractions away", duration_minutes: 2 },
      { step: 2, action: "Open the work and read the first line", duration_minutes: 1 },
      { step: 3, action: `Work on: ${goal}`, duration_minutes: estMinutes - 6 },
      { step: 4, action: "Review what you completed", duration_minutes: 2 },
      { step: 5, action: "Capture your tiny win", duration_minutes: 1 },
    ];

    store.gameEvents.add({
      user_id: "demo_user",
      game_type: "focus_boss",
      status: "created",
      data: { boss_id: bossId, goal, boss_name: bossName },
    });

    res.json({
      boss_id: bossId,
      boss_name: bossName,
      main_task: goal,
      tiny_step: "Open the file or notebook and write the first line.",
      estimated_time_minutes: estMinutes,
      battle_plan: battlePlan,
      character: "Arlo",
      arlo_message: arloMessage,
    });
  } catch (err) {
    req.log.error({ err }, "focus-boss/create failed");
    res.status(500).json({ error: "Failed to create focus boss" });
  }
});

export default router;
