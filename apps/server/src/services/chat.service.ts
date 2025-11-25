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
        role: "assistant",
        content: text
      });

      return text;
    } catch (error) {
      console.error("Error communicating with Gemini API:", error);
      throw new Error("Failed to get response from AI");
    }
  }
}

export const chatService = new ChatService();
