/**
 * Agent Settings Component
 * Responsabilidad: Mostrar y manejar los controles de configuración del agente (System Prompt y Temperature)
 */

interface AgentSettingsProps {
    systemPrompt: string;
    setSystemPrompt: (value: string) => void;
    temperature: number;
    setTemperature: (value: number) => void;
}

export const AgentSettings = ({
    systemPrompt,
    setSystemPrompt,
    temperature,
    setTemperature
}: AgentSettingsProps) => {
    return (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* System Prompt */}
                <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        System Prompt:
                    </label>
                    <input
                        type="text"
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: Eres un asistente amigable..."
                    />
                </div>

                {/* Temperature */}
                <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        Temp: {temperature.toFixed(1)}
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                </div>
            </div>
        </div>
    );
};
