"use client";

import { Toaster } from "react-hot-toast";

export default function ClientToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#111827",
          color: "#ffffff",
          fontSize: "14px",
        },
        success: {
          iconTheme: {
            primary: "#1A73E8",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#DC2626",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
}
