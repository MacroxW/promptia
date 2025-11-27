import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { messageRepository } from "@/repositories/message.repository";
import { AppError } from "@/middleware/error-handler";
import type { Message } from "@promptia/types";

interface ModelConfig {
  model: string;
  tools: { functionDeclarations: any[] };
  generationConfig?: { temperature: number };
  systemInstruction?: { parts: { text: string }[] };
}

interface ToolResult {
  weather?: string;
  temperature?: number;
  location?: string;
  unit?: string;
  imageUrl?: string;
  markdown?: string;
  message?: string;
  error?: string;
}

export class ChatService {
  private genAI: GoogleGenerativeAI;
  private readonly DEFAULT_MODEL = "gemini-2.5-flash";
  private readonly TTS_MODEL = "gemini-2.5-flash-preview-tts";
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
      await this.saveUserMessage(sessionId, message);

      const model = this.genAI.getGenerativeModel({
        model: this.DEFAULT_MODEL,
        tools: [{ functionDeclarations: this.FUNCTION_DECLARATIONS }],
      });

      const result = await model.generateContent(message);
      const response = await result.response;
      const text = response.text();

      await this.saveBotMessage(sessionId, text);

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
      await this.saveUserMessage(sessionId, message);

      const modelConfig = this.buildModelConfig(temperature, systemPrompt);
      const history = await this.buildChatHistory(sessionId, systemPrompt);
      
      const model = this.genAI.getGenerativeModel(modelConfig);
      const chat = model.startChat({ history });

      return this.handleStreamWithTools(chat, message);
    } catch (error) {
      console.error("Error communicating with Gemini API:", error);
      throw new AppError("Error al comunicarse con la IA", 500);
    }
  }

  private buildModelConfig(temperature?: number, systemPrompt?: string): ModelConfig {
    const config: ModelConfig = {
      model: this.DEFAULT_MODEL,
      tools: [{ functionDeclarations: this.FUNCTION_DECLARATIONS }],
    };

    if (temperature !== undefined) {
      config.generationConfig = { temperature };
    }

    if (systemPrompt) {
      config.systemInstruction = {
        parts: [{ text: systemPrompt }]
      };
    }

    return config;
  }

  private async buildChatHistory(sessionId: string, systemPrompt?: string): Promise<any[]> {
    // If there's a custom system prompt, start fresh without history
    // This ensures the system prompt is fully respected
    if (systemPrompt) {
      return [];
    }

    const allMessages = await messageRepository.listBySession(sessionId);
    const previousMessages = allMessages.slice(0, -1); // Exclude the current message

    return previousMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
  }

  async *handleStreamWithTools(chat: any, message: string): AsyncGenerator<any, void, unknown> {
    let result = await chat.sendMessageStream(message);
    let functionCall = null;

    // Stream chunks and check for function calls
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

    // If a function was called, execute it and stream the response
    if (functionCall) {
      const toolResult = await this.executeTool(functionCall.name, functionCall.args);
      yield* this.streamToolResponse(chat, functionCall, toolResult);
    }
  }

  private async *streamToolResponse(chat: any, functionCall: any, toolResult: ToolResult): AsyncGenerator<any, void, unknown> {
    const result = await chat.sendMessageStream([
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

    // Append image markdown if not already included
    if (functionCall.name === "generate_image" && toolResult.markdown && !geminiResponse.includes(toolResult.markdown)) {
      yield { text: "\n\n" + toolResult.markdown };
    }
  }

  async executeTool(name: string, args: any): Promise<ToolResult> {
    const tools: Record<string, (args: any) => ToolResult> = {
      get_current_weather: this.getWeather.bind(this),
      generate_image: this.generateImage.bind(this),
    };

    const tool = tools[name];
    return tool ? tool(args) : { error: "Unknown tool" };
  }

  private getWeather(args: any): ToolResult {
    const weathers = ["Sunny", "Cloudy", "Rainy", "Snowy"];
    return {
      weather: weathers[Math.floor(Math.random() * weathers.length)],
      temperature: Math.floor(Math.random() * 30) + 10,
      location: args.location,
      unit: "celsius"
    };
  }

  private generateImage(args: any): ToolResult {
    const encodedPrompt = encodeURIComponent(args.prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
    
    return {
      imageUrl,
      markdown: `![Generated Image](${imageUrl})`,
      message: "Image generated successfully. Please display the image using the provided markdown."
    };
  }

  private async saveUserMessage(sessionId: string, content: string): Promise<void> {
    await messageRepository.create({
      sessionId,
      role: "user",
      content
    });
  }

  async saveBotMessage(sessionId: string, content: string): Promise<void> {
    await messageRepository.create({
      sessionId,
      role: "agent",
      content
    });
  }

  async generateSpeech(text: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.TTS_MODEL });

      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Hablá con voz masculina, muy rápida y con acento argentino. Leé lo siguiente de manera natural:\n\n${text}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Orus",
              },
            },
          },
        } as any,
      });

      const response = await result.response;
      const pcmData = (response as any).candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!pcmData) {
        throw new AppError("No se pudo generar el audio", 500);
      }

      const pcmBuffer = Buffer.from(pcmData, 'base64');
      const wavBuffer = this.addWavHeader(pcmBuffer, 24000, 1, 16);

      return wavBuffer.toString('base64');
    } catch (error) {
      console.error("Error generating speech:", error);
      throw new AppError("Error al generar el audio", 500);
    }
  }

  private addWavHeader(pcmData: Buffer, sampleRate: number, channels: number, bitsPerSample: number): Buffer {
    const blockAlign = channels * (bitsPerSample / 8);
    const byteRate = sampleRate * blockAlign;
    const dataSize = pcmData.length;
    const headerSize = 44;
    const fileSize = headerSize + dataSize - 8;

    const header = Buffer.alloc(headerSize);

    // RIFF chunk descriptor
    header.write('RIFF', 0);
    header.writeUInt32LE(fileSize, 4);
    header.write('WAVE', 8);

    // fmt sub-chunk
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(channels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bitsPerSample, 34);

    // data sub-chunk
    header.write('data', 36);
    header.writeUInt32LE(dataSize, 40);

    return Buffer.concat([header, pcmData]);
  }
}

export const chatService = new ChatService();
