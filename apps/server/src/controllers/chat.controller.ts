import type { Request, Response, NextFunction } from "express";
import { sendMessageSchema, streamMessageSchema } from "@promptia/schemas";
import { chatService } from "../services/chat.service";
import { listMessagesBySession } from "../repositories/message.repository";
import { generateSessionTitle, updateSession } from "../services/session.service";
import { findSessionById } from "../repositories/session.repository";
import { AppError } from "../middleware/error-handler";

export class ChatController {
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return next(new AppError('No autorizado', 401));
      }

      const payload = sendMessageSchema.parse(req.body);
      const response = await chatService.sendMessage(req.user.id, payload.sessionId, payload.message);
      return res.json({ response });
    } catch (error) {
      return next(error);
    }
  }

  async streamMessage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return next(new AppError('No autorizado', 401));
      }

      const payload = streamMessageSchema.parse(req.body);

      // Set SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await chatService.streamMessage(
        req.user.id,
        payload.sessionId,
        payload.message,
        payload.systemPrompt,
        payload.temperature
      );
      let fullText = "";

      for await (const chunk of stream) {
        if (chunk.text) {
          fullText += chunk.text;
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
          if ((res as any).flush) (res as any).flush();
        }
      }

      // Save bot response to DB after streaming is complete
      await chatService.saveBotMessage(payload.sessionId, fullText);

      // Auto-generate title after 2 messages (1 user + 1 AI = 2 total messages)
      const messages = await listMessagesBySession(payload.sessionId);
      const session = await findSessionById(payload.sessionId);
      
      // Check if we have exactly 2 messages and the session still has default title
      if (messages.length === 2 && session && (session.title === "New Chat" || session.title === "Nueva conversación")) {
        try {
          const generatedTitle = await generateSessionTitle(payload.sessionId, messages);
          await updateSession(req.user.id, payload.sessionId, { title: generatedTitle });
        } catch (error) {
          console.error("Error auto-generating title:", error);
        }
      }

      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (error) {
      console.error("Chat controller error:", error);
      if (!res.headersSent) {
        return next(error);
      } else {
        res.write(`data: ${JSON.stringify({ error: "Error interno del servidor" })}\n\n`);
        res.end();
      }
    }
  }
}

export const chatController = new ChatController();
