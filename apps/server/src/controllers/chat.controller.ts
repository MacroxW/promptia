import { Request, Response } from "express";
import { chatService } from "../services/chat.service";
import { listMessagesBySession } from "../repositories/message.repository";
import { generateSessionTitle, updateSession } from "../services/session.service";
import { findSessionById } from "../repositories/session.repository";

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
      const { message, sessionId, systemPrompt, temperature } = req.body;
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

      const stream = await chatService.streamMessage(
        userId,
        sessionId,
        message,
        systemPrompt,
        temperature
      );
      let fullText = "";

      for await (const chunk of stream) {
        if (chunk.text) {
          fullText += chunk.text;
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
          // Attempt to flush if possible (not standard in Express without compression, but good practice)
          if ((res as any).flush) (res as any).flush();
        }
      }

      // Save bot response to DB after streaming is complete
      await chatService.saveBotMessage(sessionId, fullText);

      // Auto-generate title after 2 messages (1 user + 1 AI = 2 total messages)
      const messages = await listMessagesBySession(sessionId);
      const session = await findSessionById(sessionId);
      
      // Check if we have exactly 2 messages and the session still has default title
      if (messages.length === 2 && session && (session.title === "New Chat" || session.title === "Nueva conversación")) {
        try {
          const generatedTitle = await generateSessionTitle(sessionId, messages);
          await updateSession(userId, sessionId, { title: generatedTitle });
        } catch (error) {
          console.error("Error auto-generating title:", error);
          // Don't fail the request if title generation fails
        }
      }

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
