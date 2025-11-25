import React from 'react';

interface MessageBubbleProps {
    text: string;
    sender: "user" | "bot";
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ text, sender }) => {
    return (
        <div className={`flex mb-4 ${sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-md ${sender === "user"
                ? "bg-blue-600 text-white rounded-br-sm"
                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm"
                }`}>
                {text}
            </div>
        </div>
    );
};
