import type { Request, Response, NextFunction } from "express";
import { sendMessageSchema, streamMessageSchema } from "@promptia/schemas";
import { chatService } from "../services/chat.service";
import { messageRepository } from "../repositories/message.repository";
import { sessionService } from "../services/session.service";
import { sessionRepository } from "../repositories/session.repository";
import { AppError } from "../middleware/error-handler";
import { ObjectId } from "mongodb";

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

      // Validate sessionId format
      if (!ObjectId.isValid(payload.sessionId)) {
        return next(new AppError('Invalid session ID format', 400));
      }

      // Check if session exists and belongs to user
      const session = await sessionRepository.findById(payload.sessionId);
      if (!session) {
        return next(new AppError('Session not found', 404));
      }
      if (session.userId !== req.user.id) {
        return next(new AppError('Forbidden: Not your session', 403));
      }

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
      const messages = await messageRepository.listBySession(payload.sessionId);

      // Check if we have exactly 2 messages and the session still has default title
      if (messages.length === 2 && (session.title === "New Chat" || session.title === "Nueva conversación")) {
        try {
          const generatedTitle = await sessionService.generateTitle(payload.sessionId, messages);
          await sessionService.update(req.user.id, payload.sessionId, { title: generatedTitle });
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

  async generateAudio(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return next(new AppError('No autorizado', 401));
      }

      const { text } = req.body;

      if (!text || typeof text !== 'string') {
        return next(new AppError('Text is required', 400));
      }

      const audioData = await chatService.generateSpeech(text);

      return res.json({ audioData });
    } catch (error) {
      return next(error);
    }
  }
}

export const chatController = new ChatController();
