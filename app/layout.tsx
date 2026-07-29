import { AuthProvider } from "@/context/AuthContext";
import FirestoreErrorHandler from "@/components/FirestoreErrorHandler";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { ThemeInjector } from "@/components/presentation/ThemeInjector";
import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "AMEXAN — Clinical Intelligence",
  description: "AI-powered clinical decision support system",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2F80ED",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body style={{ background: "var(--surface)", color: "var(--text-primary)" }}>
        <ThemeInjector>
          <FirestoreErrorHandler>
            <AuthProvider>
              {children}
            </AuthProvider>
          </FirestoreErrorHandler>
        </ThemeInjector>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}