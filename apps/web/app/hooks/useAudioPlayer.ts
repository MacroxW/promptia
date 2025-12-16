import { useState, useRef, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Audio Player Hook
 * Responsabilidad: Generar audio desde la API y controlar reproducción
 */

interface UseAudioPlayerReturn {
    isPlaying: boolean;
    generateAndPlay: (text: string) => Promise<void>;
    pause: () => void;
}

/**
 * Función helper para llamar a la API de audio
 */
const fetchAudioFromAPI = async (text: string): Promise<string> => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/api/chat/generate-audio`, {
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
    return audioData;
};

export const useAudioPlayer = (): UseAudioPlayerReturn => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const generateAndPlay = useCallback(async (text: string) => {
        // Obtener audio de la API
        const audioData = await fetchAudioFromAPI(text);

        // Detener audio anterior si existe
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        // Crear nuevo elemento de audio
        const audio = new Audio(`data:audio/wav;base64,${audioData}`);
        audioRef.current = audio;

        // Configurar eventos
        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
            setIsPlaying(false);
            throw new Error("Error al reproducir el audio");
        };

        // Reproducir
        await audio.play();
    }, []);

    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    }, []);

    return {
        isPlaying,
        generateAndPlay,
        pause
    };
};
