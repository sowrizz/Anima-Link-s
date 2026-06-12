import { store } from "./store";
import { analyzeMessageLLM } from "./llm";

const ABSOLUTIST_WORDS = [
  "never",
  "always",
  "every",
  "nothing",
  "nobody",
  "everyone",
  "impossible",
  "completely",
  "totally",
  "absolutely",
  "forever",
  "worthless",
  "useless",
  "fail",
  "failure",
  "worst",
  "ruined",
  "destroyed",
  "hopeless",
  "pointless",
];

const DISTORTION_PATTERNS: Record<string, RegExp> = {
  overgeneralization: /\b(never|always|every|everyone|nobody|nothing|all)\b/i,
  catastrophizing:
    /\b(worst|terrible|horrible|disaster|ruined|destroyed|catastrophe|awful)\b/i,
  "all-or-nothing":
    /\b(completely|totally|absolutely|perfect|failure|worthless)\b/i,
  "fortune-telling": /\b(will fail|going to|won't work|bound to)\b/i,
  magnification: /\b(massive|huge|enormous|incredibly|so bad)\b/i,
};

function detectAbsolutistWords(message: string): string[] {
  const lower = message.toLowerCase();
  return ABSOLUTIST_WORDS.filter((w) => lower.includes(w));
}

function detectDistortion(message: string): string {
  for (const [distortion, pattern] of Object.entries(DISTORTION_PATTERNS)) {
    if (pattern.test(message)) return distortion;
  }
  return "none";
}

function calculateMSI(
  absolutistWords: string[],
  distortion: string,
  messageLength: number
): { score: number; label: string } {
  let score = 20;
  score += absolutistWords.length * 12;
  if (distortion !== "none") score += 20;
  if (messageLength > 100) score += 10;
  if (messageLength > 200) score += 10;
  score = Math.min(score, 100);

  let label = "Balanced";
  if (score >= 80) label = "High Strain";
  else if (score >= 60) label = "Moderate Strain";
  else if (score >= 40) label = "Mild Strain";
  else if (score >= 20) label = "Low";

  return { score, label };
}

function determineIntent(
  absolutistWords: string[],
  distortion: string
): string {
  if (distortion !== "none" || absolutistWords.length > 0)
    return "needs_cbt_support";
  return "general_conversation";
}

function determineRecommendedPath(
  msiScore: number,
  distortion: string,
  intent: string
): string[] {
  if (msiScore >= 70) {
    if (distortion !== "none") return ["Kael", "Nova", "Arlo"];
    return ["Kael", "Sera", "Zen"];
  }
  if (distortion !== "none") return ["Nova", "Arlo"];
  if (intent === "needs_grounding") return ["Kael", "Zen"];
  return ["Sera", "Nova"];
}

function extractMemoryQuery(message: string): string[] {
  const lower = message.toLowerCase();
  const keywords: string[] = [];
  if (lower.includes("exam") || lower.includes("test")) keywords.push("exam stress");
  if (lower.includes("assignment") || lower.includes("homework")) keywords.push("assignment");
  if (lower.includes("never") || lower.includes("finish")) keywords.push("never finish");
  if (lower.includes("meeting")) keywords.push("meeting anxiety");
  if (lower.includes("focus") || lower.includes("distract")) keywords.push("focus friction");
  if (lower.includes("fail") || lower.includes("mess")) keywords.push("failure fear");
  if (keywords.length === 0) {
    const words = lower.split(/\s+/).filter((w) => w.length > 4);
    return words.slice(0, 3);
  }
  return keywords;
}

function determineSuggestedGame(
  distortion: string,
  msiScore: number
): string {
  if (distortion !== "none") return "thought_monster_battle";
  if (msiScore >= 60) return "focus_boss_fight";
  return "mood_quest";
}

function generateSafeResponse(
  absolutistWords: string[],
  distortion: string,
  msiLabel: string
): string {
  if (absolutistWords.length > 0) {
    return `I noticed the words "${absolutistWords.slice(0, 2).join('" and "')}" — those are strong words. Before we accept that thought, let's look at it together.`;
  }
  if (distortion === "catastrophizing") {
    return "That sounds really heavy. Let's slow down and look at what we know for certain right now.";
  }
  if (msiLabel === "High Strain") {
    return "You're carrying a lot right now. I'm here. Let's take this one small step at a time.";
  }
  return "I hear you. Let's work through this together.";
}

export async function performAnalysis(
  message: string,
  userId = "demo_user",
  sessionId = "session_001"
) {
  const savedMessage = store.messages.add({
    user_id: userId,
    session_id: sessionId,
    role: "user",
    content: message,
  });

  const absolutistWords = detectAbsolutistWords(message);
  const distortion = detectDistortion(message);
  const { score: msiScore, label: msiLabel } = calculateMSI(
    absolutistWords,
    distortion,
    message.length
  );
  const intent = determineIntent(absolutistWords, distortion);

  let llmResult = null;
  try {
    llmResult = await analyzeMessageLLM(message);
  } catch {
    // fallback to deterministic
  }

  const emotion = llmResult?.emotion ?? (msiScore >= 70 ? "high_stress" : msiScore >= 50 ? "mild_anxiety" : "calm");
  const finalDistortion = llmResult?.distortion ?? distortion;
  const finalMsiScore = llmResult?.msi_score ?? msiScore;
  const finalMsiLabel = llmResult?.msi_label ?? msiLabel;
  const finalAbsolutistWords = absolutistWords.length > 0 ? absolutistWords : (llmResult?.absolutist_words ?? []);
  const finalIntent = llmResult?.intent ?? intent;
  const recommendedPath = llmResult?.recommended_path ?? determineRecommendedPath(finalMsiScore, finalDistortion, finalIntent);
  const memoryQuery = llmResult?.memory_query ?? extractMemoryQuery(message);
  const suggestedGame = llmResult?.suggested_game ?? determineSuggestedGame(finalDistortion, finalMsiScore);
  const safeResponse = llmResult?.safe_response ?? generateSafeResponse(finalAbsolutistWords, finalDistortion, finalMsiLabel);
  const trigger = llmResult?.trigger ?? (finalAbsolutistWords.length > 0 ? "cognitive_distortion" : "general_stress");

  const searchQuery = memoryQuery.join(" ");
  const memoryResults = store.memories.search(searchQuery);

  const savedAnalysis = store.analyses.add({
    message_id: savedMessage.id,
    emotion,
    msi_score: finalMsiScore,
    msi_label: finalMsiLabel,
    distortion: finalDistortion,
    trigger,
    absolutist_words: finalAbsolutistWords,
    recommended_path: recommendedPath,
    suggested_game: suggestedGame,
    safe_response: safeResponse,
  });

  return {
    analysis_id: savedAnalysis.id,
    message_id: savedMessage.id,
    emotion,
    msi_score: finalMsiScore,
    msi_label: finalMsiLabel,
    absolutist_words: finalAbsolutistWords,
    distortion: finalDistortion,
    trigger,
    intent: finalIntent,
    recommended_path: recommendedPath,
    memory_query: memoryQuery,
    suggested_game: suggestedGame,
    safe_response: safeResponse,
    memory_results: memoryResults.map((m) => ({
      id: m.id,
      title: m.title,
      summary: m.summary,
      trigger: m.trigger,
      emotion: m.emotion,
      distortion: m.distortion,
      reframe: m.reframe,
      character: m.character,
      created_at: m.created_at,
    })),
  };
}
