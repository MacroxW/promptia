import { Links, Meta, Scripts, ScrollRestoration, useNavigate, Link } from "react-router";
import { useEffect, useState } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    window.location.href = "/login"; // Force a reload/redirect to clear state cleanly
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
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
              {isLoading ? (
                <div className="flex gap-3 animate-pulse">
                  <div className="w-20 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              ) : isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                >
                  Logout
                </button>
              ) : (
                <>
                  <a href="/login" className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">
                    Login
                  </a>
                  <button className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium shadow-sm hover:shadow-md transition-all">
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="min-h-screen">
          {children}
        </main>

        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
          <div className="container mx-auto px-6 py-8 text-center text-sm text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Promptia. All rights reserved.
          </div>
        </footer>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
