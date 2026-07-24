import "./globals.css";
import { Pixelify_Sans, IBM_Plex_Mono } from "next/font/google";

const pixelify = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata = {
  title: "cache",
  description: "a moodboard tool you can actually style — paste, arrange, and make it yours",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${pixelify.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
