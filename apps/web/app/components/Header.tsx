import { Link } from "react-router";

interface HeaderProps {
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  onLogout: () => void;
}

export const Header = ({ isAuthenticated, isCheckingAuth, onLogout }: HeaderProps) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        <div aria-label="title">
          <Link to="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
            Promptia
          </Link>
        </div>

        <nav aria-label="navs">
          <div className="flex space-x-6">
            <a href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
              Inicio
            </a>
            <a href="/chat" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
              Chat
            </a>
            {!isAuthenticated && (
              <a href="/login" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                Login
              </a>
            )}
          </div>
        </nav>

        <div aria-label="auth" className="flex gap-3">
          {isCheckingAuth ? (
            <div className="flex gap-3 animate-pulse">
              <div className="w-20 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ) : isAuthenticated ? (
            <button
              onClick={onLogout}
              className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              Cerrar Sesión
            </button>
          ) : (
            <>
              <a href="/login" className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">
                Login
              </a>
              <a href="/register" className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium shadow-sm hover:shadow-md transition-all">
                Register
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
