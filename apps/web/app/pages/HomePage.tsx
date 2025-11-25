

export const HomePage = () => {
    return (
        <div className="container mx-auto px-6 py-12">
            {/* Hero Section */}
            <div className="text-center mb-16">
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome to My Web App
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                    A modern web application built with React and Tailwind CSS
                </p>
                <div className="flex gap-4 justify-center">
                    <a href="/chat" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all">
                        Start Chatting
                    </a>
                    <a href="/login" className="px-6 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-gray-800 transition-all">
                        Login
                    </a>
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-2xl">💬</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Real-time Chat</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Communicate instantly with our intelligent chat system
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-2xl">🔒</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Secure Authentication</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Your data is protected with modern security practices
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-2xl">⚡</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Fast & Responsive</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Built with performance and user experience in mind
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;