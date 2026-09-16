import type { Metadata } from "next";
import "@/styles/globals.css";
import { PublicLayoutWrapper } from "@/components/layout/PublicLayoutWrapper";

export const metadata: Metadata = {
  title: {
    default: "Olhar Museu (por SiMOP) — Portal Editorial dos Museus de Ouro Preto",
    template: "%s | Olhar Museu (por SiMOP)",
  },
  description:
    "Portal editorial e jornalístico focado em notícias, exposições, patrimônio, arte sacra, memória e cultura dos museus de Ouro Preto.",
  keywords: [
    "Museus de Ouro Preto",
    "Patrimônio Histórico",
    "Inconfidência Mineira",
    "Arte Sacra",
    "Barroco",
    "Aleijadinho",
    "SiMOP",
    "Cultura Minas Gerais",
  ],
  authors: [{ name: "Olhar Museu / SiMOP" }],
  creator: "SiMOP — Sistema de Museus de Ouro Preto",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://olharmuseu.com.br",
    title: "Olhar Museu (por SiMOP) — Portal Editorial dos Museus de Ouro Preto",
    description:
      "Jornalismo cultural, memória e acervos dos museus e do patrimônio de Ouro Preto.",
    siteName: "Olhar Museu por SiMOP",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col justify-between bg-[#FAF7F2] text-night antialiased selection:bg-gold selection:text-night">
        <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
      </body>
    </html>
  );
}
