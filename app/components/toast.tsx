import { useEffect } from "react";

type ToastProps = {
  message: string;
  onDismiss: () => void;
};

export const Toast = ({ message, onDismiss }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => {
      clearTimeout(timer);
    };
  }, [onDismiss]);

  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-50 rounded-2xl border border-white/10 bg-[rgba(12,12,18,0.95)] px-5 py-3 text-sm text-white shadow-lg"
    >
      {message}
    </div>
  );
};
