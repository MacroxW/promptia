import { Links, Meta, Scripts, ScrollRestoration } from "react-router";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header>
          <div className="flex justify-between p-3 self-center">

            <div aria-label="title" className="">
              <h1 className="text-2xl font-bold">My Web App</h1>
            </div>
            <nav aria-label="navs">
              <div className="container mx-auto p-4 flex space-x-4">
                <a href="/" className="">
                  Inicio
                </a>
                <a href="/chat" className="">
                  Chat
                </a>
                <a href="/login" className="">
                  Login
                </a>
              </div>
            </nav>
            <div aria-label="auth">
              <button>
                Login
              </button>
              <button>
                Register
              </button>
            </div>
          </div>
        </header>
        <main>
          {children}
        </main>
        <footer>
          <div className="container mx-auto p-4 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} My Web App. All rights reserved.
          </div>
        </footer>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
