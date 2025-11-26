import React from 'react';
import { useAudio } from '../hooks/useAudio';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
    text: string;
    sender: "user" | "bot";
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ text, sender }) => {
    const { isLoading, isPlaying, playAudio, pauseAudio } = useAudio();

    const handleAudioClick = () => {
        if (isPlaying) {
            pauseAudio();
        } else {
            playAudio(text);
        }
    };

    return (
        <div className={`flex mb-4 ${sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-md ${sender === "user"
                ? "bg-blue-600 text-white rounded-br-sm"
                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm"
                }`}>
                <div className="flex items-start gap-2">
                    <div className="flex-1">
                        {sender === "bot" ? (
                            <div className="markdown-body">
                                <ReactMarkdown>{text}</ReactMarkdown>
                            </div>
                        ) : (
                            text
                        )}
                    </div>
                    {sender === "bot" && (
                        <button
                            onClick={handleAudioClick}
                            disabled={isLoading}
                            className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                            title={isPlaying ? "Pausar audio" : "Reproducir audio"}
                        >
                            {isLoading ? (
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : isPlaying ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                                </svg>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
