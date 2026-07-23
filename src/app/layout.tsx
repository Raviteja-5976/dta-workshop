import type { Metadata } from "next";
import { Space_Grotesk, Inter, Alex_Brush } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/providers/LenisProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import GoogleAnalytics from "@/components/Analytics/GoogleAnalytics";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const alexBrush = Alex_Brush({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Workshop.DevTrackAcademy | Build. Break. Learn. Repeat.",
  description: "Join live, small-batch, mentor-driven coding workshops where you build real projects, complete assignments, and receive direct mentor feedback.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${alexBrush.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-cream text-deep-navy font-sans select-none">
        <GoogleAnalytics />
        <AuthProvider>
          <LenisProvider>
            {children}
          </LenisProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

