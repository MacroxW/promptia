import { useState } from "react";
import { useAudioPlayer } from "./useAudioPlayer";

/**
 * Audio Hook
 * Responsabilidad: Manejar estado de carga y errores para la reproducción de audio
 */

interface UseAudioReturn {
    isLoading: boolean;
    isPlaying: boolean;
    error: string | null;
    playAudio: (text: string) => Promise<void>;
    pauseAudio: () => void;
}

export const useAudio = (): UseAudioReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { isPlaying, generateAndPlay, pause } = useAudioPlayer();

    const playAudio = async (text: string) => {
        try {
            setIsLoading(true);
            setError(null);

            // Generar y reproducir audio
            await generateAndPlay(text);
        } catch (err) {
            console.error("Error generating/playing audio:", err);
            setError(err instanceof Error ? err.message : "Error al generar el audio");
        } finally {
            setIsLoading(false);
        }
    };

    const pauseAudio = () => {
        pause();
    };

    return {
        isLoading,
        isPlaying,
        error,
        playAudio,
        pauseAudio
    };
};
