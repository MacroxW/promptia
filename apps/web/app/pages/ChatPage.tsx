import { useState } from "react";

const ChatPage = () => {

    const [messages, setMessages] = useState<{
        sender: "user" | "bot";
        text: string
    }[]>([])

    const [input, setInput] = useState("")

    const handleSend = () => {
        if (!input.trim()) {
            return
        }

        setMessages([...messages, { sender: "user", text: input }])
        setInput("")

        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: "Respuesta simulada del señor Bot." },
            ])
        }, 1000)
    }


    return (
        <div className="container mx-auto px-6 py-8 max-w-4xl">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                    <h1 className="text-2xl font-bold text-white">Chat</h1>
                </div>

                {/* Messages Container */}
                <div className="h-96 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <p>No hay mensajes aún. ¡Comienza la conversación!</p>
                        </div>
                    ) : (
                        messages.map((m, i) => (
                            <div key={i} className={`flex mb-4 ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-md ${m.sender === "user"
                                        ? "bg-blue-600 text-white rounded-br-sm"
                                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm"
                                    }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Escribí un mensaje..." />

                        <button
                            onClick={handleSend}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!input.trim()}
                        >
                            Enviar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;