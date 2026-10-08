"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: "var(--surface)",
          color: "var(--text)",
          border: "1px solid var(--border)",
          borderRadius: "0.75rem",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          fontSize: "0.875rem",
          fontWeight: 500,
          padding: "10px 16px",
        },
        success: {
          iconTheme: {
            primary: "var(--success)",
            secondary: "var(--surface)",
          },
        },
        error: {
          iconTheme: {
            primary: "var(--danger)",
            secondary: "var(--surface)",
          },
        },
      }}
    />
  );
}
