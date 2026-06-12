import { Router, type IRouter } from "express";

const router: IRouter = Router();

const SAMPLE_WORKSPACE_OBJECTS = [
  { label: "notebook", game_label: "Focus Tome", category: "study_tool", confidence: "high" },
  { label: "phone", game_label: "Distraction Goblin", category: "distraction", confidence: "high" },
  { label: "water bottle", game_label: "Health Potion", category: "wellness", confidence: "medium" },
  { label: "laptop", game_label: "Focus Portal", category: "study_tool", confidence: "high" },
  { label: "headphones", game_label: "Focus Shield", category: "focus_tool", confidence: "medium" },
  { label: "textbook", game_label: "Knowledge Tome", category: "study_tool", confidence: "high" },
  { label: "coffee cup", game_label: "Energy Elixir", category: "wellness", confidence: "medium" },
  { label: "pencil", game_label: "Clarity Wand", category: "study_tool", confidence: "low" },
];

async function analyzeWithVision(imageBase64: string): Promise<typeof SAMPLE_WORKSPACE_OBJECTS | null> {
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
        model: "gpt-4o",
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content: "You analyze workspace/study desk images and identify objects. Return JSON only. Do NOT analyze faces, people, or make any diagnostic statements. Focus only on physical objects visible in the workspace.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: 'Identify objects on this desk/workspace. Return JSON: {"objects": [{"label": "object name", "game_label": "creative game label", "category": "study_tool|distraction|wellness|focus_tool|other", "confidence": "high|medium|low"}]}. Limit to 6 most visible objects.',
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: "low",
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) return null;
    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? "";
    const parsed = JSON.parse(content) as { objects: typeof SAMPLE_WORKSPACE_OBJECTS };
    return parsed.objects ?? null;
  } catch {
    return null;
  }
}

function calculateFocusScore(objects: typeof SAMPLE_WORKSPACE_OBJECTS): number {
  let score = 70;
  const distractions = objects.filter((o) => o.category === "distraction").length;
  const focusTools = objects.filter(
    (o) => o.category === "study_tool" || o.category === "focus_tool"
  ).length;
  score -= distractions * 15;
  score += focusTools * 5;
  return Math.max(10, Math.min(100, score));
}

function suggestMission(objects: typeof SAMPLE_WORKSPACE_OBJECTS, focusScore: number): string {
  if (focusScore < 50) return "Remove distractions and start a 5-minute focus sprint";
  if (objects.some((o) => o.category === "wellness")) return "Health Potion detected — stay hydrated during your focus session";
  return "Workspace looks ready — start a Focus Boss Fight to begin your session";
}

router.post("/camera/analyze-workspace", async (req, res) => {
  try {
    const { image_base64 } = req.body as { image_base64: string; mode?: string };

    let objects = null;
    let source = "sample";

    if (image_base64 && image_base64.length > 100) {
      objects = await analyzeWithVision(image_base64);
      if (objects) source = "vision_ai";
    }

    if (!objects) {
      const sampleCount = 4 + Math.floor(Math.random() * 3);
      objects = SAMPLE_WORKSPACE_OBJECTS.slice(0, sampleCount);
      source = "sample";
    }

    const focusScore = calculateFocusScore(objects);
    const workspaceState = focusScore >= 70 ? "focused_study_desk" : "distracted_workspace";
    const suggestedMission = suggestMission(objects, focusScore);

    res.json({
      objects,
      workspace_state: workspaceState,
      suggested_mission: suggestedMission,
      focus_score: focusScore,
      source,
    });
  } catch (err) {
    req.log.error({ err }, "camera/analyze-workspace failed");
    res.json({
      objects: SAMPLE_WORKSPACE_OBJECTS.slice(0, 4),
      workspace_state: "study_desk",
      suggested_mission: "Start a 5-minute focus sprint",
      focus_score: 65,
      source: "sample",
    });
  }
});

export default router;
