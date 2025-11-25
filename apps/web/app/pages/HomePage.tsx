import { FeatureCard } from "../components/FeatureCard";

export const HomePage = () => {
    return (
        <div className="container mx-auto px-6 py-12">

            <div className="text-center mb-16">
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Bienvenido a Promptia
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                    Una aplicación web moderna construida con React y Tailwind CSS
                </p>
                <div className="flex gap-4 justify-center">
                    <a href="/chat" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all">
                        Comenzar a chatear
                    </a>
                    <a href="/login" className="px-6 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-gray-800 transition-all">
                        Iniciar sesión
                    </a>
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8">
                <FeatureCard
                    icon="💬"
                    title="Chat en tiempo real"
                    description="Comunicate al instante con nuestro sistema de chat inteligente"
                    iconBgClass="bg-blue-100 dark:bg-blue-900"
                />

                <FeatureCard
                    icon="🔒"
                    title="Autenticación segura"
                    description="Tu datos estan protegidos con prácticas modernas de seguridad"
                    iconBgClass="bg-purple-100 dark:bg-purple-900"
                />

                <FeatureCard
                    icon="⚡"
                    title="Rápido y Responsive"
                    description="Construido con rendimiento y experiencia del usuario en mente"
                    iconBgClass="bg-green-100 dark:bg-green-900"
                />
            </div>
        </div>
    );
};

export default HomePage;