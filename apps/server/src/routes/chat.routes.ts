import { Router } from "express";
import { chatController } from "../controllers/chat.controller";

const router: Router = Router();

router.post("/", chatController.sendMessage);
router.post("/stream", chatController.streamMessage);
router.post("/generate-audio", chatController.generateAudio);

export default router;
