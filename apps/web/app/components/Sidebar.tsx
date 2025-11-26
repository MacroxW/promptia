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
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchSessions();
    }, []);

    useEffect(() => {
        // Refresh sessions every 2 seconds to catch auto-generated titles
        const interval = setInterval(() => {
            fetchSessions();
        }, 2000);
        return () => clearInterval(interval);
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

    const handleRenameStart = (session: Session) => {
        setEditingSessionId(session.id);
        setEditTitle(session.title);
    };

    const handleRenameCancel = () => {
        setEditingSessionId(null);
        setEditTitle("");
    };

    const handleRenameSubmit = async (sessionId: string) => {
        if (!editTitle.trim()) {
            handleRenameCancel();
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:4000/api/sessions/${sessionId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ title: editTitle.trim() })
            });

            if (response.ok) {
                const updatedSession = await response.json();
                setSessions(sessions.map(s => s.id === sessionId ? updatedSession : s));
                handleRenameCancel();
            }
        } catch (error) {
            console.error("Error renaming session:", error);
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
                        className={`px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${currentSessionId === session.id ? "bg-blue-50 dark:bg-gray-800 border-r-4 border-blue-600" : ""
                            }`}
                    >
                        {editingSessionId === session.id ? (
                            <div className="flex flex-col gap-2">
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleRenameSubmit(session.id);
                                        if (e.key === 'Escape') handleRenameCancel();
                                    }}
                                    className="px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-blue-500 rounded focus:outline-none"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleRenameSubmit(session.id)}
                                        className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Guardar
                                    </button>
                                    <button
                                        onClick={handleRenameCancel}
                                        className="flex-1 px-2 py-1 text-xs bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start justify-between gap-2">
                                <div 
                                    onClick={() => onSessionSelect(session.id)}
                                    className="flex-1 cursor-pointer"
                                >
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                                        {session.title || "Untitled Chat"}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {new Date(session.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRenameStart(session);
                                    }}
                                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    title="Renombrar chat"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
