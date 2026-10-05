import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ebi-study-japan.n24jg5scym.chatgpt.site"),
  title: "EBI Study Library | Japan Admissions Resources",
  description: "EJU resources, university data, and a multilingual AI-assisted statement checker.",
  icons: { icon: "/ebi-icon.png", shortcut: "/ebi-icon.png" },
  openGraph: {
    title: "EBI Study Library",
    description: "EJU resources, university data, and AI-assisted statement review.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "EBI Study Library" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EBI Study Library",
    description: "EJU resources, university data, and AI-assisted statement review.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
