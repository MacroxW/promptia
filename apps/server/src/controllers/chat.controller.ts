import { Request, Response } from "express";
import { chatService } from "../services/chat.service";

export class ChatController {
  async sendMessage(req: Request, res: Response) {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const response = await chatService.sendMessage(message);
      return res.json({ response });
    } catch (error) {
      console.error("Chat controller error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

export const chatController = new ChatController();
