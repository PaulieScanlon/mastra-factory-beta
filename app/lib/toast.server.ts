import { createCookieSessionStorage } from "react-router";

const storage = createCookieSessionStorage({
  cookie: {
    name: "__riff_toast",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET ?? "riff-toast-secret"]
  }
});

export const setToast = async (request: Request, message: string) => {
  const session = await storage.getSession(request.headers.get("Cookie"));
  session.flash("toast", message);
  return storage.commitSession(session);
};

export const getToast = async (request: Request) => {
  const session = await storage.getSession(request.headers.get("Cookie"));
  const message = session.get("toast") as string | undefined;
  return {
    message: message ?? null,
    headers: { "Set-Cookie": await storage.commitSession(session) }
  };
};
