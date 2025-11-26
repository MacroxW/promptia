import { useState, useRef } from "react";

interface UseAudioReturn {
    isLoading: boolean;
    isPlaying: boolean;
    error: string | null;
    playAudio: (text: string) => Promise<void>;
    pauseAudio: () => void;
}

export const useAudio = (): UseAudioReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const playAudio = async (text: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:4000/api/chat/generate-audio", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                throw new Error("Failed to generate audio");
            }

            const { audioData } = await response.json();

            // Create audio element with data URL
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }

            // Use data URL format for audio
            const audio = new Audio(`data:audio/wav;base64,${audioData}`);
            audioRef.current = audio;

            audio.onplay = () => setIsPlaying(true);
            audio.onended = () => {
                setIsPlaying(false);
            };
            audio.onerror = () => {
                setError("Error al reproducir el audio");
                setIsPlaying(false);
            };

            await audio.play();
        } catch (err) {
            console.error("Error generating/playing audio:", err);
            setError("Error al generar el audio");
        } finally {
            setIsLoading(false);
        }
    };

    const pauseAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    return {
        isLoading,
        isPlaying,
        error,
        playAudio,
        pauseAudio
    };
};

// Helper function to convert base64 to Blob
function base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}
