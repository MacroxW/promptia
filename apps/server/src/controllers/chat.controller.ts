import { Request, Response } from "express";
import { chatService } from "../services/chat.service";

export class ChatController {
  async sendMessage(req: Request, res: Response) {
    try {
      const { message, sessionId } = req.body;
      const userId = (req as any).user?.id;

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
  async streamMessage(req: Request, res: Response) {
    try {
      const { message, sessionId } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!message || !sessionId) {
        return res.status(400).json({ error: "Message and sessionId are required" });
      }

      // Set SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const result = await chatService.streamMessage(userId, sessionId, message);
      let fullText = "";

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }

      // Save bot response to DB after streaming is complete
      // We need to import createMessage or expose a method in chatService to save it.
      // Since chatService.sendMessage saves it, we should probably add a method to save bot message in service.
      // For now, let's add a helper in ChatService or just call the repository directly if possible, 
      // but better to keep it in service. 
      // Let's add a saveBotMessage method to ChatService.
      await chatService.saveBotMessage(sessionId, fullText);

      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (error) {
      console.error("Chat controller error:", error);
      // If headers are already sent, we can't send a JSON error.
      // We might send an error event.
      if (!res.headersSent) {
        return res.status(500).json({ error: "Internal server error" });
      } else {
        res.write(`data: ${JSON.stringify({ error: "Internal server error" })}\n\n`);
        res.end();
      }
    }
  }
}

export const chatController = new ChatController();
