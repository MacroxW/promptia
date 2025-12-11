import { useState, useCallback } from "react";

/**
 * Session Editor Hook
 * Responsabilidad: Gestión del modo de edición de títulos
 */

interface UseSessionEditorReturn {
    editingSessionId: string | null;
    editTitle: string;
    startEditing: (sessionId: string, currentTitle: string) => void;
    cancelEditing: () => void;
    updateEditTitle: (title: string) => void;
}

export const useSessionEditor = (): UseSessionEditorReturn => {
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");

    const startEditing = useCallback((sessionId: string, currentTitle: string) => {
        setEditingSessionId(sessionId);
        setEditTitle(currentTitle);
    }, []);

    const cancelEditing = useCallback(() => {
        setEditingSessionId(null);
        setEditTitle("");
    }, []);

    const updateEditTitle = useCallback((title: string) => {
        setEditTitle(title);
    }, []);

    return {
        editingSessionId,
        editTitle,
        startEditing,
        cancelEditing,
        updateEditTitle
    };
};
