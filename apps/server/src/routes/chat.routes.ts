import { Router } from "express";
import { chatController } from "../controllers/chat.controller";

const router: Router = Router();

router.post("/", chatController.sendMessage.bind(chatController));
router.post("/stream", chatController.streamMessage.bind(chatController));
router.post("/generate-audio", chatController.generateAudio.bind(chatController));

export default router;
