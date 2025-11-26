import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
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
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: [
        {
          functionDeclarations: [
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
          ],
        },
      ],
    });
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

  async streamMessage(
    userId: string,
    sessionId: string,
    message: string,
    systemPrompt?: string,
    temperature?: number
  ) {
    try {
      // Save user message
      await createMessage({
        sessionId,
        role: "user",
        content: message
      });

      // Build generation config
      const generationConfig: any = {};

      if (temperature !== undefined) {
        generationConfig.temperature = temperature;
      }

      // Build model config
      const modelConfig: any = {
        model: "gemini-2.5-flash",
        tools: [
          {
            functionDeclarations: [
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
            ],
          },
        ],
      };

      // Add generation config if we have temperature
      if (Object.keys(generationConfig).length > 0) {
        modelConfig.generationConfig = generationConfig;
      }

      // Add system instruction if provided
      if (systemPrompt) {
        modelConfig.systemInstruction = {
          parts: [{ text: systemPrompt }]
        };
      }

      // Create a new model instance with custom config
      const model = this.genAI.getGenerativeModel(modelConfig);

      // Start chat without system instruction in history
      const chat = model.startChat({
        history: [],
      });

      return this.handleStreamWithTools(chat, message);
    } catch (error) {
      console.error("Error communicating with Gemini API:", error);
      throw new Error("Failed to get response from AI");
    }
  }

  async *handleStreamWithTools(chat: any, message: string): AsyncGenerator<any, void, unknown> {
    let result = await chat.sendMessageStream(message);

    let functionCall = null;

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();

      // Check for function call - works with both old and new SDK versions
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
      
      // If it was an image generation and Gemini didn't include the markdown, append it
      if (functionCall.name === "generate_image" && typeof toolResult === 'object' && toolResult.markdown) {
        // Check if Gemini already included the markdown in its response
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
    await createMessage({
      sessionId,
      role: "agent",
      content
    });
  }
}

export const chatService = new ChatService();
