import { Sidebar } from "../components/Sidebar";
import { MessageBubble } from "../components/MessageBubble";
import { AgentSettings } from "../components/AgentSettings";
import { useChat } from "../hooks/useChat";
import { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router";

const ChatPage = () => {
    const { sessionId } = useParams<{ sessionId?: string }>();
    const navigate = useNavigate();

    const {
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
    } = useChat(sessionId);

    const handleSessionSelect = useCallback((id: string) => {
        setCurrentSessionId(id);
        navigate(`/chat/${id}`);
    }, [navigate, setCurrentSessionId]);

    useEffect(() => {
        if (sessionId && sessionId !== currentSessionId) {
            setCurrentSessionId(sessionId);
        }
    }, [sessionId, currentSessionId, setCurrentSessionId]);

    useEffect(() => {
        if (!sessionId && currentSessionId) {
            navigate(`/chat/${currentSessionId}`, { replace: true });
        }
    }, [sessionId, currentSessionId, navigate]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/login";
        }
    }, []);

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            <Sidebar
                currentSessionId={currentSessionId}
                onSessionSelect={handleSessionSelect}
            />

            <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">Chat</h1>
                </div>

                {/* Agent Settings */}
                <AgentSettings
                    systemPrompt={systemPrompt}
                    setSystemPrompt={setSystemPrompt}
                    temperature={temperature}
                    setTemperature={setTemperature}
                />

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
                            <MessageBubble key={i} text={m.text || ""} sender={m.sender} />
                        ))
                    )}
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-3 max-w-4xl mx-auto">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Escribí un mensaje..."
                            disabled={!currentSessionId}
                        />

                        <button
                            onClick={handleSend}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!input.trim() || isLoading || !currentSessionId}
                        >
                            {isLoading ? "..." : "Enviar"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
