import { Router, type IRouter } from "express";
import healthRouter from "./health";
import analyzeRouter from "./analyze";
import memoryRouter from "./memory";
import charactersRouter from "./characters";
import gamesRouter from "./games";
import cameraRouter from "./camera";
import voiceRouter from "./voice";
import tinywinRouter from "./tinywin";
import reportsRouter from "./reports";
import safetyRouter from "./safety";

const router: IRouter = Router();

router.use(healthRouter);
router.use(analyzeRouter);
router.use(memoryRouter);
router.use(charactersRouter);
router.use(gamesRouter);
router.use(cameraRouter);
router.use(voiceRouter);
router.use(tinywinRouter);
router.use(reportsRouter);
router.use(safetyRouter);

export default router;
