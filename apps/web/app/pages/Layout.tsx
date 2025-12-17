import { Links, Meta, Scripts, ScrollRestoration } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isCheckingAuth, logout } = useAuth();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-100 dark:bg-gray-900" suppressHydrationWarning>
        <Header 
          isAuthenticated={isAuthenticated} 
          isCheckingAuth={isCheckingAuth} 
          onLogout={logout} 
        />

        <main className="min-h-screen">
          {children}
        </main>

        <Footer />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
