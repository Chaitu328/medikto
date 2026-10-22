import React, { useState, useEffect } from "react";
import notify from "./notificationService";
import ToastItem from "./ToastItem";

/**
 * Global Toast Container for Medikto Super Admin Panel
 * Mounted at the application root so notifications float over content and modals.
 */
export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = notify.subscribe((currentToasts) => {
      setToasts(currentToasts);
    });
    return unsubscribe;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[99999] pointer-events-none flex flex-col gap-3 w-[calc(100vw-2rem)] sm:w-[380px] md:w-[420px] max-w-full"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={(id) => notify.dismiss(id)}
        />
      ))}
    </div>
  );
}
