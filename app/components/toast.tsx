import { useEffect, useState } from "react";

export const Toast = ({ message }: { message: string }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-50 rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur px-5 py-3 text-sm text-white shadow-lg animate-toast-in"
    >
      {message}
    </div>
  );
};
