import { Request, Response } from "express";
import { chatService } from "../services/chat.service";

export class ChatController {
  async sendMessage(req: Request, res: Response) {
    try {
      const { message, sessionId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!message || !sessionId) {
        return res.status(400).json({ error: "Message and sessionId are required" });
      }

      const response = await chatService.sendMessage(userId, sessionId, message);
      return res.json({ response });
    } catch (error) {
      console.error("Chat controller error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

export const chatController = new ChatController();
