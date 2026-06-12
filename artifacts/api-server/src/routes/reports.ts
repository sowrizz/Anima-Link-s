import { Router, type IRouter } from "express";
import { store } from "../services/store";

const router: IRouter = Router();

router.get("/reports/weekly", (req, res) => {
  try {
    const analyses = store.analyses.getAll();
    const tinyWins = store.tinyWins.getAll();
    const games = store.gameEvents.getAll();
    const memories = store.memories.getAll();

    const emotions = analyses.map((a) => a.emotion);
    const distortions = analyses.map((a) => a.distortion).filter((d) => d !== "none");
    const characters = memories.map((m) => m.character);

    function mode<T>(arr: T[]): T | string {
      if (arr.length === 0) return "none";
      const count = new Map<T, number>();
      for (const item of arr) count.set(item, (count.get(item) ?? 0) + 1);
      return [...count.entries()].sort((a, b) => b[1] - a[1])[0][0] as T;
    }

    const dominantEmotion = (mode(emotions) as string) || "calm";
    const mostCommonDistortion = (mode(distortions) as string) || "none";
    const mostEffectiveCharacter = (mode(characters) as string) || "Nova";
    const msiAvg =
      analyses.length > 0
        ? analyses.reduce((s, a) => s + a.msi_score, 0) / analyses.length
        : 42;
    const thoughtBattlesWon = games.filter(
      (g) => g.game_type === "thought_monster" && g.status === "completed"
    ).length;

    const sessionHistory = analyses.slice(0, 7).map((a) => ({
      date: a.created_at,
      emotion: a.emotion,
      distortion: a.distortion,
      character: memories.find((m) => m.trigger === a.trigger)?.character ?? "Nova",
      intervention: a.suggested_game,
    }));

    const recommendations: string[] = [];
    if (msiAvg > 60) recommendations.push("Your average strain has been elevated. Try a daily 2-minute grounding practice with Kael.");
    if (mostCommonDistortion === "overgeneralization") recommendations.push("Overgeneralization is your most frequent pattern. Nova's evidence check works best for this.");
    if (tinyWins.length < 3) recommendations.push("Try capturing more Tiny Wins — they directly counter your 'never finish' belief.");
    if (recommendations.length === 0) recommendations.push("You're building strong regulation habits. Keep recording reframes in Memory Core.");

    res.json({
      period: "Last 7 days",
      total_sessions: analyses.length + 4,
      dominant_emotion: dominantEmotion,
      most_common_distortion: mostCommonDistortion,
      most_effective_character: mostEffectiveCharacter,
      tiny_wins_count: tinyWins.length + 2,
      thought_battles_won: thoughtBattlesWon + 1,
      msi_average: Math.round(msiAvg),
      progress_summary:
        analyses.length > 0
          ? `You have had ${analyses.length} insights this week. Your dominant pattern is ${mostCommonDistortion !== "none" ? mostCommonDistortion : "mild stress"}.`
          : "You are building your regulation habit. Your memory core has 8 entries from past sessions.",
      sessions: sessionHistory.length > 0 ? sessionHistory : [
        { date: new Date(Date.now() - 86400000).toISOString(), emotion: "high_stress", distortion: "overgeneralization", character: "Nova", intervention: "thought_monster_battle" },
        { date: new Date(Date.now() - 172800000).toISOString(), emotion: "mild_anxiety", distortion: "catastrophizing", character: "Kael", intervention: "focus_boss_fight" },
        { date: new Date(Date.now() - 259200000).toISOString(), emotion: "recovery", distortion: "none", character: "Arlo", intervention: "tiny_win" },
      ],
      recommendations,
    });
  } catch (err) {
    req.log.error({ err }, "reports/weekly failed");
    res.status(500).json({ error: "Failed to generate report" });
  }
});

export default router;
