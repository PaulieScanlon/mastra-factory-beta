import {
  data,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation
} from "react-router";

import type { Route } from "./+types/root";
import { Nav } from "./components/nav";
import { Toast } from "./components/toast";
import { getToast } from "./lib/toast.server";
import "./app.css";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { message, headers } = await getToast(request);
  return data({ toast: message }, { headers });
};

export const links: Route.LinksFunction = () => {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap"
    }
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Riff — a listening log</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="grain" />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  const location = useLocation();
  return (
    <>
      <Nav />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <Outlet />
      </main>
      {loaderData.toast ? (
        <Toast key={`${loaderData.toast}-${location.key}`} message={loaderData.toast} />
      ) : null}
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Something skipped.";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : `${error.status}`;
    details = error.status === 404 ? "That track isn't on the shelf." : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-24">
      <h1 className="font-display text-6xl mb-4">{message}</h1>
      <p className="text-white/60 text-lg">{details}</p>
      {stack ? (
        <pre className="w-full mt-6 p-4 overflow-x-auto text-xs bg-white/5 border border-white/10 rounded-xl">
          <code>{stack}</code>
        </pre>
      ) : null}
    </main>
  );
}
