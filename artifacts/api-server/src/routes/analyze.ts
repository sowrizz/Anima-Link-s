import { Router, type IRouter } from "express";
import { performAnalysis } from "../services/analyzer";

const router: IRouter = Router();

router.post("/analyze-message", async (req, res) => {
  try {
    const { message, user_id, session_id } = req.body as {
      message: string;
      user_id?: string;
      session_id?: string;
    };

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "message is required" });
      return;
    }

    const result = await performAnalysis(message, user_id, session_id);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "analyze-message failed");
    res.status(500).json({ error: "Analysis failed" });
  }
});

export default router;
