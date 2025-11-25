import { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { MessageBubble } from "../components/MessageBubble";
import { ChatInput } from "../components/ChatInput";

const ChatPage = () => {
    const [messages, setMessages] = useState<{
        sender: "user" | "bot";
        text: string
    }[]>([])

    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string>("");

    useEffect(() => {
        if (currentSessionId) {
            fetchSessionMessages(currentSessionId);
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
                    sender: msg.role === "assistant" ? "bot" : msg.role,
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
            return
        }

        const userMessage = input;
        setMessages(prev => [...prev, { sender: "user", text: userMessage }])
        setInput("")
        setIsLoading(true);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:4000/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: userMessage,
                    sessionId: currentSessionId
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get response");
            }

            const data = await response.json();
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: data.response },
            ]);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: "Lo siento, hubo un error al procesar tu mensaje." },
            ]);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex h-[calc(100vh-64px)]">
            <Sidebar
                currentSessionId={currentSessionId}
                onSessionSelect={setCurrentSessionId}
            />

            <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">Chat</h1>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!currentSessionId ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <p>Selecciona o crea un chat para comenzar</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <p>No hay mensajes aún. ¡Comienza la conversación!</p>
                        </div>
                    ) : (
                        messages.map((m, i) => (
                            <MessageBubble key={i} text={m.text} sender={m.sender} />
                        ))
                    )}
                </div>

                {/* Input Area */}
                <ChatInput
                    value={input}
                    onChange={setInput}
                    onSend={handleSend}
                    isLoading={isLoading}
                    disabled={!currentSessionId}
                />

            </div>
        </div>
    );
};

export default ChatPage;