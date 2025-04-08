import React, { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css"; // These styles apply to every route in the application

export const metadata: Metadata = {
  title: "Pathize Web",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
