import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

interface Session {
    id: string;
    title: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

interface SidebarProps {
    currentSessionId?: string;
    onSessionSelect: (sessionId: string) => void;
}

export const Sidebar = ({ currentSessionId, onSessionSelect }: SidebarProps) => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:4000/api/sessions", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setSessions(data.sessions);

                // Select first session if none selected and sessions exist
                if (!currentSessionId && data.sessions.length > 0) {
                    onSessionSelect(data.sessions[0].id);
                }
            }
        } catch (error) {
            console.error("Error fetching sessions:", error);
        }
    };

    const handleNewChat = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:4000/api/sessions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ title: "New Chat" })
            });

            if (response.ok) {
                const newSession = await response.json();
                setSessions([newSession, ...sessions]);
                onSessionSelect(newSession.id);
            }
        } catch (error) {
            console.error("Error creating session:", error);
        }
    };

    return (
        <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
            <div className="p-4">
                <button
                    onClick={handleNewChat}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                    <span>+</span> New Chat
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {sessions.map((session) => (
                    <div
                        key={session.id}
                        onClick={() => onSessionSelect(session.id)}
                        className={`px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${currentSessionId === session.id ? "bg-blue-50 dark:bg-gray-800 border-r-4 border-blue-600" : ""
                            }`}
                    >
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                            {session.title || "Untitled Chat"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
