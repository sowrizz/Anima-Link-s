import { logger } from "../lib/logger";

interface LLMResponse {
  content: string;
}

async function callOpenAI(prompt: string): Promise<string | null> {
  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a mental health companion AI. Always respond with valid JSON only. Be compassionate but evidence-based. Never diagnose. Focus on cognitive patterns and actionable support.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) return null;
    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    return data.choices?.[0]?.message?.content ?? null;
  } catch (err) {
    logger.error({ err }, "OpenAI call failed");
    return null;
  }
}

export async function analyzeMessageLLM(message: string): Promise<{
  emotion: string;
  msi_score: number;
  msi_label: string;
  absolutist_words: string[];
  distortion: string;
  trigger: string;
  intent: string;
  recommended_path: string[];
  memory_query: string[];
  suggested_game: string;
  safe_response: string;
} | null> {
  const prompt = `Analyze this message from a mental health companion perspective. Return JSON only.

Message: "${message}"

Return this exact JSON structure:
{
  "emotion": "one of: calm, mild_anxiety, high_stress, low_energy, overwhelm, recovery",
  "msi_score": <integer 0-100, Mental Strain Index>,
  "msi_label": "one of: Balanced, Mild Strain, Moderate Strain, High Strain, Critical",
  "absolutist_words": ["list", "of", "absolutist", "words", "found", "like", "never", "always", "nothing", "impossible"],
  "distortion": "primary cognitive distortion: overgeneralization, catastrophizing, all-or-nothing, mind-reading, fortune-telling, magnification, emotional-reasoning, personalization, should-statements, labeling, or none",
  "trigger": "brief trigger phrase like exam_pressure, meeting_anxiety, social_fear",
  "intent": "needs_cbt_support, needs_grounding, needs_validation, needs_motivation, needs_safety, or general_conversation",
  "recommended_path": ["character1", "character2", "character3"] where characters are Sera/Kael/Nova/Zen/Arlo,
  "memory_query": ["keyword1", "keyword2", "keyword3"] for searching relevant memories,
  "suggested_game": "thought_monster_battle, focus_boss_fight, camera_mission, tiny_win, mood_quest, or none",
  "safe_response": "a brief, warm, non-diagnostic first response from the companion (1-2 sentences)"
}`;

  try {
    const raw = await callOpenAI(prompt);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return null;
  }
}

export async function generateThoughtMonsterLLM(
  message: string,
  distortion: string,
  absolutistWords: string[]
): Promise<{
  monster_name: string;
  weakness: string;
  cbt_question_1: string;
  cbt_question_2: string;
  cbt_question_3: string;
  safe_reframe: string;
  recommended_next_action: string;
} | null> {
  const prompt = `Generate a CBT-based thought challenge for this mental health companion app. Return JSON only.

Thought: "${message}"
Distortion: ${distortion}
Absolutist words: ${absolutistWords.join(", ")}

Return this exact JSON:
{
  "monster_name": "Creative name for the cognitive distortion (e.g. 'Never-Finish Beast', 'Always-Wrong Shadow')",
  "weakness": "What specific CBT technique defeats this distortion",
  "cbt_question_1": "First evidence-checking question (what is the thought trying to make you believe?)",
  "cbt_question_2": "Second evidence question (what evidence does NOT fully support this thought?)",
  "cbt_question_3": "Third reframe question (what would you say to a friend who had this thought?)",
  "safe_reframe": "A gentle, realistic alternative thought (not toxic positivity)",
  "recommended_next_action": "Smallest concrete action to take right now"
}`;

  try {
    const raw = await callOpenAI(prompt);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function generateFocusBossLLM(
  goal: string,
  linkedThought: string
): Promise<{
  boss_name: string;
  arlo_message: string;
  battle_plan: Array<{ step: number; action: string; duration_minutes: number }>;
} | null> {
  const prompt = `Generate a focus battle plan for a mental health companion app. Return JSON only.

Goal: "${goal}"
Linked thought: "${linkedThought}"

Return this exact JSON:
{
  "boss_name": "Creative name for the procrastination/overwhelm boss (e.g. 'Deadline Demon', 'Focus Thief')",
  "arlo_message": "Motivating message from Arlo the Action character (1-2 sentences, practical and warm)",
  "battle_plan": [
    {"step": 1, "action": "First tiny action (30 seconds to 2 minutes)", "duration_minutes": 1},
    {"step": 2, "action": "Second action", "duration_minutes": 5},
    {"step": 3, "action": "Third action", "duration_minutes": 10},
    {"step": 4, "action": "Fourth action", "duration_minutes": 5},
    {"step": 5, "action": "Capture tiny win", "duration_minutes": 1}
  ]
}`;

  try {
    const raw = await callOpenAI(prompt);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
