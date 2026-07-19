import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "CityPulse AI - Smart Civic Intelligence & AI-Reporting Platform",
  description: "Bridging the gap between citizens and city departments. Report public infrastructure issues in seconds, watch AI analyze and prioritize them, and track repairs in real-time.",
  keywords: ["civic", "reporting", "city infrastructure", "AI reporting", "Gemini vision", "potholes", "garbage disposal", "community rewards"],
  authors: [{ name: "CityPulse Team" }],
  openGraph: {
    title: "CityPulse AI - Empowering Citizens Through AI-Powered Civic Reporting",
    description: "Report civic issues in seconds. Gemini AI analyzes photos to categorize, prioritize, and dispatch complaints to municipal departments while earning points.",
    type: "website",
    locale: "en_US",
    siteName: "CityPulse AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "CityPulse AI - Smart Civic Reporting",
    description: "Report civic issues in seconds. Gemini AI analyzes photos to categorize, prioritize, and dispatch complaints.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen transition-colors duration-300 relative">
        {/* Global Background Image Layer (Light Theme Only) */}
        <div 
          className="fixed inset-0 pointer-events-none z-[-12] select-none bg-cover bg-center bg-no-repeat opacity-[0.05] dark:opacity-0 transition-opacity duration-300"
          style={{ 
            backgroundImage: "url('/bg-poly.jpg')"
          }}
        ></div>

        {/* Floating Ambient Aurora Background Blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-10] select-none">
          {/* Blob 1: Indigo/Purple/Pink Gradient */}
          <div className="absolute top-[-15%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-indigo-500/22 via-purple-500/18 to-pink-500/22 dark:from-primary/5 dark:via-purple-950/5 dark:to-pink-950/5 blur-[140px] animate-aurora-slow"></div>
          
          {/* Blob 2: Saffron/Orange/Red Gradient */}
          <div className="absolute bottom-[-15%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-amber-500/18 via-orange-500/18 to-red-500/18 dark:from-accent/5 dark:via-emerald-950/5 dark:to-teal-950/5 blur-[140px] animate-aurora-fast"></div>
          
          {/* Blob 3: Emerald/Teal/Blue Gradient */}
          <div className="absolute top-[35%] left-[25%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-tr from-emerald-400/15 via-teal-500/12 to-blue-500/15 dark:from-indigo-500/3 dark:via-blue-950/3 dark:to-indigo-950/3 blur-[120px] animate-aurora-medium"></div>
        </div>

        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              {children}
              <Toaster 
                position="top-right" 
                toastOptions={{
                  style: {
                    background: 'var(--card)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '0.5rem',
                  },
                  success: {
                    iconTheme: {
                      primary: 'var(--accent)',
                      secondary: 'var(--accent-foreground)',
                    },
                  },
                }} 
              />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
