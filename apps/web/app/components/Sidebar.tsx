import { useSessions } from "../hooks/useSessions";
import { useSessionEditor } from "../hooks/useSessionEditor";

/**
 * Sidebar Component
 * Responsabilidad: Presentación de la UI del sidebar
 */

interface SidebarProps {
    currentSessionId?: string;
    onSessionSelect: (sessionId: string) => void;
}

export const Sidebar = ({ currentSessionId, onSessionSelect }: SidebarProps) => {
    // Hooks para manejar sesiones y edición
    const { sessions, createSession, updateSessionTitle } = useSessions({
        currentSessionId,
        onSessionSelect
    });

    const {
        editingSessionId,
        editTitle,
        startEditing,
        cancelEditing,
        updateEditTitle
    } = useSessionEditor();

    // Handlers
    const handleNewChat = async () => {
        await createSession("New Chat");
    };

    const handleRenameStart = (sessionId: string, currentTitle: string) => {
        startEditing(sessionId, currentTitle);
    };

    const handleRenameSubmit = async (sessionId: string) => {
        if (!editTitle.trim()) {
            cancelEditing();
            return;
        }

        const success = await updateSessionTitle(sessionId, editTitle.trim());
        if (success) {
            cancelEditing();
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
                                    onChange={(e) => updateEditTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleRenameSubmit(session.id);
                                        if (e.key === 'Escape') cancelEditing();
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
                                        onClick={cancelEditing}
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
                                        handleRenameStart(session.id, session.title);
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
