import { logger } from "../lib/logger";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = "gemini-2.5-flash";

type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

export function isGeminiConfigured() {
  return Boolean(process.env["GEMINI_API_KEY"] || process.env["GOOGLE_API_KEY"]);
}

function getGeminiApiKey() {
  return process.env["GEMINI_API_KEY"] || process.env["GOOGLE_API_KEY"] || "";
}

function getGeminiModel() {
  return process.env["GEMINI_MODEL"] || DEFAULT_MODEL;
}

function stripJsonFence(text: string) {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

async function callGemini(
  parts: GeminiPart[],
  options: {
    systemInstruction?: string;
    json?: boolean;
    temperature?: number;
  } = {}
): Promise<string | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  try {
    const model = getGeminiModel();
    const response = await fetch(
      `${GEMINI_API_BASE}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: options.systemInstruction
            ? { parts: [{ text: options.systemInstruction }] }
            : undefined,
          contents: [{ role: "user", parts }],
          generationConfig: {
            temperature: options.temperature ?? 0.25,
            ...(options.json ? { responseMimeType: "application/json" } : {}),
          },
        }),
      }
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      logger.warn({ status: response.status, body }, "Gemini call failed");
      return null;
    }

    const data = (await response.json()) as GeminiResponse;
    return data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim() ?? null;
  } catch (err) {
    logger.error({ err }, "Gemini call failed");
    return null;
  }
}

async function callGeminiJson<T>(
  prompt: string,
  systemInstruction: string,
  temperature = 0.2
): Promise<T | null> {
  const raw = await callGemini([{ text: prompt }], {
    systemInstruction,
    json: true,
    temperature,
  });
  if (!raw) return null;

  try {
    return JSON.parse(stripJsonFence(raw)) as T;
  } catch (err) {
    logger.warn({ err, raw }, "Gemini returned invalid JSON");
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

  return callGeminiJson(
    prompt,
    "You are Anima-Link, a compassionate but evidence-based mental health companion. Always respond with valid JSON only. Never diagnose. Encourage professional or emergency support for safety risk. Keep support practical and non-alarmist."
  );
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
  "monster_name": "Creative name for the cognitive distortion",
  "weakness": "What specific CBT technique defeats this distortion",
  "cbt_question_1": "First evidence-checking question",
  "cbt_question_2": "Second evidence question",
  "cbt_question_3": "Third reframe question",
  "safe_reframe": "A gentle, realistic alternative thought",
  "recommended_next_action": "Smallest concrete action to take right now"
}`;

  return callGeminiJson(
    prompt,
    "You are a CBT-informed support designer. Return valid JSON only. Never diagnose. Keep questions gentle, specific, and safe."
  );
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
  "boss_name": "Creative name for the procrastination/overwhelm boss",
  "arlo_message": "Motivating message from Arlo the Action character (1-2 sentences, practical and warm)",
  "battle_plan": [
    {"step": 1, "action": "First tiny action", "duration_minutes": 1},
    {"step": 2, "action": "Second action", "duration_minutes": 5},
    {"step": 3, "action": "Third action", "duration_minutes": 10},
    {"step": 4, "action": "Fourth action", "duration_minutes": 5},
    {"step": 5, "action": "Capture tiny win", "duration_minutes": 1}
  ]
}`;

  return callGeminiJson(
    prompt,
    "You are a practical executive-function coach. Return valid JSON only. Break work into concrete, low-friction actions."
  );
}

export async function analyzeWorkspaceImageLLM(
  imageBase64: string,
  mimeType = "image/jpeg"
): Promise<{
  objects: Array<{ label: string; game_label: string; category: string; confidence: string }>;
  workspace_state: string;
  suggested_mission: string;
  focus_score: number;
} | null> {
  const raw = await callGemini(
    [
      {
        text:
          'Analyze this workspace/study-room image. Focus only on visible physical objects and environment, not faces or people. Return JSON only: {"objects":[{"label":"object name","game_label":"mature short helpful label","category":"study_tool|distraction|wellness|focus_tool|other","confidence":"high|medium|low"}],"workspace_state":"brief_state_slug","suggested_mission":"one concrete stabilizing/focus action","focus_score":0-100}. Limit objects to 8.',
      },
      { inlineData: { mimeType, data: imageBase64 } },
    ],
    {
      systemInstruction:
        "You are an object-focused vision assistant for a wellbeing prototype. Do not identify people, infer sensitive traits, or diagnose. Return valid JSON only.",
      json: true,
      temperature: 0.15,
    }
  );
  if (!raw) return null;

  try {
    return JSON.parse(stripJsonFence(raw));
  } catch (err) {
    logger.warn({ err, raw }, "Gemini vision returned invalid JSON");
    return null;
  }
}

export async function transcribeAudioLLM(
  audioBase64: string,
  mimeType = "audio/m4a"
): Promise<string | null> {
  const raw = await callGemini(
    [
      { text: 'Transcribe this audio exactly. Return JSON only: {"transcript":"..."}' },
      { inlineData: { mimeType, data: audioBase64 } },
    ],
    {
      systemInstruction: "You are a careful transcription engine. Return valid JSON only.",
      json: true,
      temperature: 0,
    }
  );
  if (!raw) return null;

  try {
    const parsed = JSON.parse(stripJsonFence(raw)) as { transcript?: string };
    return parsed.transcript?.trim() || null;
  } catch {
    return null;
  }
}

export async function routeVoiceLLM(transcript: string): Promise<{
  route: string;
  action: string;
  params: Record<string, unknown>;
} | null> {
  const prompt = `Route this spoken request to the best app destination. Return JSON only.

Transcript: "${transcript}"

Routes:
- chat / send_message
- thought_monster / start_thought_monster
- focus_boss / start_focus_boss
- camera_mission / open_camera
- breathing_reset / start_breathing
- memory / open_memory
- support_modes / open_companions
- report / open_report
- safety / open_safety
- voice_room / open_voice
- tiny_win / open_tiny_win

Return: {"route":"...","action":"...","params":{"transcript":"...","message":"optional"}}`;

  return callGeminiJson(
    prompt,
    "You route voice commands for a mental health companion app. Prefer safety for crisis language. Return valid JSON only.",
    0.1
  );
}

export async function routeCharactersLLM(
  analysis: Record<string, unknown>,
  userPreference?: string
): Promise<{
  recommended_path: string[];
  primary_character: string;
  reason: string;
  character_responses: Array<{ name: string; role: string; message: string; reason: string }>;
} | null> {
  const prompt = `Choose companion characters and write their replies. Return JSON only.

Analysis: ${JSON.stringify(analysis)}
User preference: ${userPreference ?? "none"}

Characters:
- Sera: empathic mirror
- Kael: grounding force
- Nova: CBT challenger
- Zen: mindful guide
- Arlo: action motivator

Return:
{
  "recommended_path": ["Sera"],
  "primary_character": "Sera",
  "reason": "brief routing reason",
  "character_responses": [
    {"name":"Sera","role":"Empathic Mirror","message":"brief in-character support","reason":"why this character helps"}
  ]
}`;

  return callGeminiJson(
    prompt,
    "You are Anima-Link's character router. Return valid JSON only. Keep responses warm, non-diagnostic, and actionable.",
    0.35
  );
}

export async function gradeCBTArenaLLM(
  scenario: string,
  userReply: string
): Promise<{
  aggression: "low" | "medium" | "high";
  clarity: "low" | "medium" | "high";
  solution_focus: "low" | "medium" | "high";
  distortion_pattern: string;
  guidance: string;
  improved_suggestion: string;
} | null> {
  const prompt = `Grade the user's reframed response to a difficult scenario from a Cognitive Behavioral Therapy (CBT) perspective. Return JSON only.

Scenario: "${scenario}"
User's Response: "${userReply}"

Evaluate the response and return this exact JSON structure:
{
  "aggression": "low|medium|high",
  "clarity": "low|medium|high",
  "solution_focus": "low|medium|high",
  "distortion_pattern": "Name of cognitive distortion/pattern in user's original thoughts or the scenario, like Overgeneralization, Catastrophizing, Personalization, Mind Reading, or None",
  "guidance": "Constructive, supportive feedback helping them frame their response better if needed (1-2 sentences)",
  "improved_suggestion": "An example of a calmer, reframed, assertive but non-aggressive response that is highly solution-focused"
}`;

  return callGeminiJson<{
    aggression: "low" | "medium" | "high";
    clarity: "low" | "medium" | "high";
    solution_focus: "low" | "medium" | "high";
    distortion_pattern: string;
    guidance: string;
    improved_suggestion: string;
  }>(
    prompt,
    "You are a CBT trainer evaluating user responses. Return valid JSON only. Be highly encouraging and practical."
  );
}

