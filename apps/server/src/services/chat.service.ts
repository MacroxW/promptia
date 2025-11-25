import { GoogleGenerativeAI } from "@google/generative-ai";
import { createMessage } from "@/repositories/message.repository";

export class ChatService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async sendMessage(userId: string, sessionId: string, message: string): Promise<string> {
    try {
      // Save user message
      await createMessage({
        sessionId,
        role: "user",
        content: message
      });

      const result = await this.model.generateContent(message);
      const response = await result.response;
      const text = response.text();

      // Save bot response
      await createMessage({
        sessionId,
        role: "agent",
        content: text
      });

      return text;
    } catch (error) {
      console.error("Error communicating with Gemini API:", error);
      throw new Error("Failed to get response from AI");
    }
  }
  async streamMessage(userId: string, sessionId: string, message: string) {
    try {
      // Save user message
      await createMessage({
        sessionId,
        role: "user",
        content: message
      });

      const result = await this.model.generateContentStream(message);

      // We need to handle saving the full response. 
      // Since we are returning the stream, the controller will consume it.
      // We can wrap the stream or let the controller handle saving the final text.
      // Better approach: Return the result stream, and let the controller handle the streaming to response.
      // But we also need to save the message to DB.
      // We can accumulate the text as we stream in the controller, then save it.

      return result;
    } catch (error) {
      console.error("Error communicating with Gemini API:", error);
      throw new Error("Failed to get response from AI");
    }
  }

  async saveBotMessage(sessionId: string, content: string) {
    await createMessage({
      sessionId,
      role: "agent",
      content
    });
  }
}

export const chatService = new ChatService();
