import type { Metadata } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const title = "Alex Castillo González — Applied AI Engineer (Python, LLM)";
const description =
  "Applied AI engineer working in Python: RAG over regulatory text with citations you " +
  "can check, agents, and the evaluation and failure handling that decide whether an " +
  "LLM feature survives real users. Remote, UTC−4. Open to full-time roles.";

export const metadata: Metadata = {
  // Required for og:image to resolve to an absolute URL. LinkedIn drops the
  // preview entirely when it cannot fetch the image, which is what a relative
  // path gives it.
  metadataBase: new URL("https://portfolio-alexgonzalez33.vercel.app"),
  title,
  description,
  openGraph: { title, description, type: "website", url: "/" },
  twitter: { card: "summary_large_image", title, description },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-stone-50 text-stone-900">
        {children}
      </body>
    </html>
  );
}
