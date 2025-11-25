import { Router } from "express";
import { chatController } from "../controllers/chat.controller";

const router: Router = Router();

router.post("/", chatController.sendMessage.bind(chatController));

export default router;
