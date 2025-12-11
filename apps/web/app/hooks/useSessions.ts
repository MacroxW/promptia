import { useState, useCallback, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Interfaz de sesión
 */
export interface Session {
    id: string;
    title: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Funciones helper para llamar a la API de sesiones
 */
const API_BASE_URL = `${API_URL}/api/sessions`;

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
};

const fetchSessionsFromAPI = async (): Promise<Session[]> => {
    const response = await fetch(API_BASE_URL, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error("Failed to fetch sessions");
    }

    const data = await response.json();
    return data.sessions;
};

const createSessionInAPI = async (title: string): Promise<Session> => {
    const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ title })
    });

    if (!response.ok) {
        throw new Error("Failed to create session");
    }

    return await response.json();
};

const updateSessionTitleInAPI = async (sessionId: string, title: string): Promise<Session> => {
    const response = await fetch(`${API_BASE_URL}/${sessionId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ title })
    });

    if (!response.ok) {
        throw new Error("Failed to update session");
    }

    return await response.json();
};

/**
 * Sessions Hook
 * Responsabilidad: Gestión del estado de sesiones y lógica de negocio
 */

interface UseSessionsReturn {
    sessions: Session[];
    isLoading: boolean;
    error: string | null;
    createSession: (title: string) => Promise<Session | null>;
    updateSessionTitle: (sessionId: string, title: string) => Promise<boolean>;
    refreshSessions: () => Promise<void>;
}

interface UseSessionsOptions {
    currentSessionId?: string;
    onSessionSelect: (sessionId: string) => void;
    autoRefreshInterval?: number;
}

export const useSessions = ({
    currentSessionId,
    onSessionSelect,
    autoRefreshInterval = 2000
}: UseSessionsOptions): UseSessionsReturn => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refreshSessions = useCallback(async () => {
        try {
            setError(null);
            const fetchedSessions = await fetchSessionsFromAPI();
            setSessions(fetchedSessions);

            // Seleccionar primera sesión si no hay ninguna seleccionada
            if (!currentSessionId && fetchedSessions.length > 0) {
                onSessionSelect(fetchedSessions[0].id);
            }
        } catch (err) {
            console.error("Error fetching sessions:", err);
            setError(err instanceof Error ? err.message : "Error al cargar sesiones");
        }
    }, [currentSessionId, onSessionSelect]);

    const createSession = useCallback(async (title: string): Promise<Session | null> => {
        try {
            setIsLoading(true);
            setError(null);
            const newSession = await createSessionInAPI(title);
            setSessions([newSession, ...sessions]);
            onSessionSelect(newSession.id);
            return newSession;
        } catch (err) {
            console.error("Error creating session:", err);
            setError(err instanceof Error ? err.message : "Error al crear sesión");
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [sessions, onSessionSelect]);

    const updateSessionTitle = useCallback(async (sessionId: string, title: string): Promise<boolean> => {
        try {
            setError(null);
            const updatedSession = await updateSessionTitleInAPI(sessionId, title);
            setSessions(sessions.map(s => s.id === sessionId ? updatedSession : s));
            return true;
        } catch (err) {
            console.error("Error updating session:", err);
            setError(err instanceof Error ? err.message : "Error al actualizar sesión");
            return false;
        }
    }, [sessions]);

    // Cargar sesiones al montar
    useEffect(() => {
        refreshSessions();
    }, [refreshSessions]);

    // Auto-refresh periódico
    useEffect(() => {
        if (autoRefreshInterval > 0) {
            const interval = setInterval(() => {
                refreshSessions();
            }, autoRefreshInterval);
            return () => clearInterval(interval);
        }
    }, [refreshSessions, autoRefreshInterval]);

    return {
        sessions,
        isLoading,
        error,
        createSession,
        updateSessionTitle,
        refreshSessions
    };
};
