import "./globals.css";
import {
  Space_Grotesk,
  IBM_Plex_Mono,
  Playfair_Display,
  Inter,
  Caveat,
  JetBrains_Mono,
} from "next/font/google";

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

const serif = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-serif",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-sans",
});

const hand = Caveat({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-hand",
});

const monoAlt = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono-alt",
});

export const metadata = {
  title: "cache",
  description: "paste anything. arrange it your way. cache it.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${plexMono.variable} ${serif.variable} ${sans.variable} ${hand.variable} ${monoAlt.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
