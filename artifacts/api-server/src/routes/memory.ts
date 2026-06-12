import { Router, type IRouter } from "express";
import { store } from "../services/store";

const router: IRouter = Router();

router.post("/memory/add", (req, res) => {
  try {
    const { title, content, emotion, trigger, distortion, reframe, character, memory_type } = req.body as {
      title: string;
      content: string;
      emotion: string;
      trigger: string;
      distortion?: string;
      reframe?: string;
      character?: string;
      memory_type?: string;
    };

    if (!title || !content || !emotion || !trigger) {
      res.status(400).json({ error: "title, content, emotion, trigger are required" });
      return;
    }

    const mem = store.memories.add({
      user_id: "demo_user",
      memory_type: memory_type ?? "session",
      title,
      summary: content.slice(0, 120),
      content,
      emotion,
      trigger,
      distortion: distortion ?? "none",
      reframe: reframe ?? "",
      character: character ?? "Nova",
      intervention: "user_added",
      importance: 5,
    });

    res.json({ id: mem.id, success: true });
  } catch (err) {
    req.log.error({ err }, "memory/add failed");
    res.status(500).json({ error: "Failed to add memory" });
  }
});

router.post("/memory/search", (req, res) => {
  try {
    const { query, category, limit } = req.body as {
      query: string;
      category?: string;
      limit?: number;
    };

    if (!query) {
      res.status(400).json({ error: "query is required" });
      return;
    }

    const results = store.memories.search(query, category).slice(0, limit ?? 5);

    res.json({
      query,
      results: results.map((m) => ({
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
      source: "sqlite",
    });
  } catch (err) {
    req.log.error({ err }, "memory/search failed");
    res.status(500).json({ error: "Search failed" });
  }
});

router.get("/memory/all", (req, res) => {
  try {
    const all = store.memories.getAll();
    res.json({
      memories: all.map((m) => ({
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
      total: all.length,
    });
  } catch (err) {
    req.log.error({ err }, "memory/all failed");
    res.status(500).json({ error: "Failed to get memories" });
  }
});

router.get("/memory/graph", (req, res) => {
  try {
    const memories = store.memories.getAll();
    const thoughtPairs = store.thoughtPairs.getAll();
    const tinyWins = store.tinyWins.getAll();

    const nodes = [
      ...memories.slice(0, 6).map((m) => ({
        id: m.id,
        label: m.title,
        type: m.distortion !== "none" ? "distortion" : m.memory_type,
        emotion: m.emotion,
        date: m.created_at,
      })),
      ...thoughtPairs.slice(0, 4).map((tp) => ({
        id: tp.id,
        label: "Reframe: " + tp.reframe.slice(0, 40),
        type: "reframe",
        emotion: "recovery",
        date: tp.created_at,
      })),
      ...tinyWins.slice(0, 3).map((tw) => ({
        id: tw.id,
        label: "Win: " + tw.completed_action.slice(0, 40),
        type: "tiny_win",
        emotion: "recovery",
        date: tw.created_at,
      })),
    ];

    const edges: Array<{ from: string; to: string; relation: string }> = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      if (i < 5) {
        edges.push({
          from: nodes[i].id,
          to: nodes[i + 1].id,
          relation: "leads_to",
        });
      }
    }
    if (thoughtPairs.length > 0 && memories.length > 0) {
      edges.push({
        from: memories[0].id,
        to: thoughtPairs[0].id,
        relation: "reframed_as",
      });
    }

    res.json({ nodes, edges });
  } catch (err) {
    req.log.error({ err }, "memory/graph failed");
    res.status(500).json({ error: "Failed to get graph" });
  }
});

export const thoughtPairsRouter = Router() as IRouter;
export default router;
