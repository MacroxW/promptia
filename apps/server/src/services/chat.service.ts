import { GoogleGenerativeAI } from "@google/generative-ai";

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

  async sendMessage(message: string): Promise<string> {
    try {
      const result = await this.model.generateContent(message);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error communicating with Gemini API:", error);
      throw new Error("Failed to get response from AI");
    }
  }
}

export const chatService = new ChatService();
