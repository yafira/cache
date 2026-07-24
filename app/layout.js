import "./globals.css";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";

const display = Space_Grotesk({
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
  description: "paste anything. arrange it your way. cache it.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
