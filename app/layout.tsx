import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EBI Study Library | Japan Admissions Resources",
  description: "EJU resources, recorded classes, university data, and multilingual admissions tools.",
  icons: { icon: "/ebi-icon.png", shortcut: "/ebi-icon.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
