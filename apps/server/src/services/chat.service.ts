import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { messageRepository } from "@/repositories/message.repository";
import { AppError } from "@/middleware/error-handler";

export class ChatService {
  private genAI: GoogleGenerativeAI;
  private readonly DEFAULT_MODEL = "gemini-2.5-flash";
  private readonly FUNCTION_DECLARATIONS: any[] = [
    {
      name: "get_current_weather",
      description: "Get the current weather in a given location",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          location: {
            type: SchemaType.STRING,
            description: "The city and state, e.g. San Francisco, CA",
          },
        },
        required: ["location"],
      },
    },
    {
      name: "generate_image",
      description: "Generate an image based on a prompt",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          prompt: {
            type: SchemaType.STRING,
            description: "The description of the image to generate",
          },
        },
        required: ["prompt"],
      },
    },
  ];

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new AppError("GEMINI_API_KEY no está configurada", 500);
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async sendMessage(userId: string, sessionId: string, message: string): Promise<string> {
    try {
      await messageRepository.create({
        sessionId,
        role: "user",
        content: message
      });

      const model = this.genAI.getGenerativeModel({
        model: this.DEFAULT_MODEL,
        tools: [{ functionDeclarations: this.FUNCTION_DECLARATIONS }],
      });

      const result = await model.generateContent(message);
      const response = await result.response;
      const text = response.text();

      await messageRepository.create({
        sessionId,
        role: "agent",
        content: text
      });

      return text;
    } catch (error) {
      console.error("Error communicating with Gemini API:", error);
      throw new AppError("Error al comunicarse con la IA", 500);
    }
  }

  async streamMessage(
    userId: string,
    sessionId: string,
    message: string,
    systemPrompt?: string,
    temperature?: number
  ) {
    try {
      await messageRepository.create({
        sessionId,
        role: "user",
        content: message
      });

      const modelConfig: any = {
        model: this.DEFAULT_MODEL,
        tools: [{ functionDeclarations: this.FUNCTION_DECLARATIONS }],
      };

      if (temperature !== undefined) {
        modelConfig.generationConfig = { temperature };
      }

      if (systemPrompt) {
        modelConfig.systemInstruction = {
          parts: [{ text: systemPrompt }]
        };
      }

      // Get conversation history (excluding the current message we just saved)
      const allMessages = await messageRepository.listBySession(sessionId);
      const previousMessages = allMessages.slice(0, -1); // Exclude the last message (current one)
      
      // Convert to Gemini history format
      const history = previousMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const model = this.genAI.getGenerativeModel(modelConfig);
      const chat = model.startChat({ history });

      return this.handleStreamWithTools(chat, message);
    } catch (error) {
      console.error("Error communicating with Gemini API:", error);
      throw new AppError("Error al comunicarse con la IA", 500);
    }
  }

  async *handleStreamWithTools(chat: any, message: string): AsyncGenerator<any, void, unknown> {
    let result = await chat.sendMessageStream(message);
    let functionCall = null;

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();

      let calls = chunk.functionCalls;
      if (typeof chunk.functionCalls === 'function') {
        calls = chunk.functionCalls();
      }

      if (calls && calls.length > 0) {
        functionCall = calls[0];
        break;
      }

      if (chunkText) {
        yield { text: chunkText };
      }
    }

    if (functionCall) {
      const toolResult = await this.executeTool(functionCall.name, functionCall.args);

      result = await chat.sendMessageStream([
        {
          functionResponse: {
            name: functionCall.name,
            response: {
              name: functionCall.name,
              content: toolResult
            }
          }
        }
      ]);

      let geminiResponse = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          geminiResponse += chunkText;
          yield { text: chunkText };
        }
      }
      
      if (functionCall.name === "generate_image" && typeof toolResult === 'object' && toolResult.markdown) {
        if (!geminiResponse.includes(toolResult.markdown)) {
          yield { text: "\n\n" + toolResult.markdown };
        }
      }
    }
  }

  async executeTool(name: string, args: any) {
    if (name === "get_current_weather") {
      const location = args.location;
      const weathers = ["Sunny", "Cloudy", "Rainy", "Snowy"];
      const temp = Math.floor(Math.random() * 30) + 10;
      const condition = weathers[Math.floor(Math.random() * weathers.length)];
      return { weather: condition, temperature: temp, location: location, unit: "celsius" };
    } else if (name === "generate_image") {
      const prompt = args.prompt;
      const encodedPrompt = encodeURIComponent(prompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
      // Return the image URL in a structured format that Gemini will use
      return { 
        imageUrl: imageUrl,
        markdown: `![Generated Image](${imageUrl})`,
        message: "Image generated successfully. Please display the image using the provided markdown."
      };
    }
    return { error: "Unknown tool" };
  }

  async saveBotMessage(sessionId: string, content: string) {
    await messageRepository.create({
      sessionId,
      role: "agent",
      content
    });
  }
}

export const chatService = new ChatService();
