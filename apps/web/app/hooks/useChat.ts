import { useState, useEffect, useRef } from "react";

interface Message {
    sender: "user" | "bot";
    text: string;
}

export const useChat = (initialSessionId?: string) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string>(initialSessionId || "");
    const [systemPrompt, setSystemPrompt] = useState<string>("");
    const [temperature, setTemperature] = useState<number>(0.7);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        // Keep the selected session in sync with the URL parameter when it changes
        if (initialSessionId && initialSessionId !== currentSessionId) {
            setCurrentSessionId(initialSessionId);
        }
    }, [initialSessionId, currentSessionId]);

    useEffect(() => {
        if (currentSessionId) {
            fetchSessionMessages(currentSessionId);
        } else {
            setMessages([]);
        }
    }, [currentSessionId]);

    const fetchSessionMessages = async (sessionId: string) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:4000/api/sessions/${sessionId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                const formattedMessages = data.messages.map((msg: any) => ({
                    sender: (msg.role === "agent" || msg.role === "assistant") ? "bot" : "user",
                    text: msg.content
                }));
                setMessages(formattedMessages);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading || !currentSessionId) {
            return;
        }

        const userMessage = input;
        setMessages(prev => [...prev, { sender: "user", text: userMessage }]);
        setInput("");
        setIsLoading(true);

        // Create a placeholder for the bot response
        setMessages(prev => [...prev, { sender: "bot", text: "" }]);

        try {
            const token = localStorage.getItem("token");
            abortControllerRef.current = new AbortController();

            const response = await fetch("http://localhost:4000/api/chat/stream", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: userMessage,
                    sessionId: currentSessionId,
                    systemPrompt: systemPrompt || undefined,
                    temperature: temperature
                }),
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                throw new Error("Failed to get response");
            }

            if (!response.body) {
                throw new Error("ReadableStream not supported");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let botResponse = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split("\n\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const dataStr = line.replace("data: ", "");
                        if (dataStr === "[DONE]") {
                            break;
                        }
                        try {
                            const data = JSON.parse(dataStr);
                            if (data.text) {
                                botResponse += data.text;
                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    const lastMessage = newMessages[newMessages.length - 1];
                                    if (lastMessage.sender === "bot") {
                                        lastMessage.text = botResponse;
                                    }
                                    return newMessages;
                                });
                            }
                        } catch (e) {
                            console.error("Error parsing SSE data:", e);
                        }
                    }
                }
            }

        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Fetch aborted');
            } else {
                console.error("Error sending message:", error);
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.sender === "bot") {
                        lastMessage.text = "Lo siento, hubo un error al procesar tu mensaje.";
                    }
                    return newMessages;
                });
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    return {
        messages,
        input,
        setInput,
        isLoading,
        currentSessionId,
        setCurrentSessionId,
        handleSend,
        systemPrompt,
        setSystemPrompt,
        temperature,
        setTemperature
    };
};
