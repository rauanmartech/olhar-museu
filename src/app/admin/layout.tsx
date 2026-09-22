"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Image as ImageIcon,
  FolderTree,
  Landmark,
  Tags,
  LogOut,
  ExternalLink,
  Menu,
  X,
  User,
  ChevronRight,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const supabase = createClient();

  // If on login page, render children directly without admin chrome
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace(`/admin/login?redirectTo=${pathname}`);
        return;
      }

      // Buscar perfil adicional em users
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      setCurrentUser({
        ...user,
        name: profile?.name || user.user_metadata?.name || user.email?.split("@")[0] || "Jornalista",
        role: profile?.role || user.user_metadata?.role || "JOURNALIST",
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
      });

      setLoading(false);
    };

    loadUser();
  }, [pathname, isLoginPage, router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.replace("/admin/login");
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-mono text-xs text-stone-dark tracking-widest uppercase">
          Carregando Painel Editorial...
        </p>
      </div>
    );
  }

  const navLinks = [
    {
      label: "Visão Geral",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Notícias & Artigos",
      href: "/admin/noticias",
      icon: FileText,
      badge: "CRUD",
    },
    {
      label: "Nova Publicação",
      href: "/admin/noticias/nova",
      icon: PlusCircle,
      highlight: true,
    },
    {
      label: "Biblioteca de Mídia",
      href: "/admin/midia",
      icon: ImageIcon,
    },
    {
      label: "Categorias",
      href: "/admin/categorias",
      icon: FolderTree,
    },
    {
      label: "Museus Parceiros",
      href: "/admin/museus",
      icon: Landmark,
    },
    {
      label: "Capas dos Museus",
      href: "/admin/museus/capas",
      icon: ImageIcon,
      badge: "WebP",
    },
    {
      label: "Tags Editoriais",
      href: "/admin/tags",
      icon: Tags,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#FAF7F2] flex flex-col lg:flex-row selection:bg-gold selection:text-night font-sans">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex w-72 flex-col bg-[#171717] border-r border-[#2C2C2C] shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* Branding Editorial */}
        <div className="p-6 border-b border-[#2C2C2C] bg-[#141414]">
          <Link href="/admin" className="block group">
            <Image
              src="/images/logo-simop-branca.webp"
              alt="Olhar Museu"
              width={220}
              height={70}
              className="h-10 w-auto object-contain transition-opacity group-hover:opacity-90"
            />
          </Link>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-gold font-semibold bg-gold/10 px-2 py-0.5 border border-gold/20 rounded">
              Painel Editorial CMS
            </span>
            <span className="font-mono text-[10px] text-stone-dark">v1.0</span>
          </div>
        </div>

        {/* Links Principais */}
        <nav className="p-4 flex-1 space-y-1">
          <div className="font-mono text-[10px] uppercase tracking-widest text-stone-dark px-3 py-2">
            Gestão de Conteúdo
          </div>

          {navLinks.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href) && (item.href !== "/admin" || pathname === "/admin");

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded text-xs font-medium transition-all ${
                  isActive
                    ? "bg-gold text-night font-bold shadow-md shadow-gold/20"
                    : item.highlight
                    ? "bg-gold/10 text-gold hover:bg-gold/20 border border-gold/30"
                    : "text-stone hover:bg-[#222222] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-night" : ""}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && !isActive && (
                  <span className="font-mono text-[9px] bg-[#2A2A2A] text-stone px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Rodapé da Sidebar com Perfil e Logout */}
        <div className="p-4 border-t border-[#2C2C2C] bg-[#141414] space-y-3">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold font-serif font-bold text-sm shrink-0">
              {currentUser?.name?.charAt(0)?.toUpperCase() || "J"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{currentUser?.name}</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-mono text-[10px] text-stone-dark capitalize">
                  {currentUser?.role?.toLowerCase() || "Jornalista"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#252525]">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 text-[11px] font-mono text-stone-dark hover:text-white bg-[#202020] hover:bg-[#2A2A2A] rounded transition-colors"
              title="Ver Portal Público"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver Site</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 text-[11px] font-mono text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/60 border border-red-900/40 rounded transition-colors cursor-pointer"
              title="Encerrar Sessão"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* HEADER MOBILE */}
      <div className="lg:hidden bg-[#171717] border-b border-[#2C2C2C] p-4 flex items-center justify-between sticky top-0 z-30">
        <Link href="/admin" className="flex items-center gap-2">
          <Image
            src="/images/logo-simop-branca.webp"
            alt="Olhar Museu"
            width={160}
            height={50}
            className="h-8 w-auto object-contain"
          />
          <span className="font-mono text-[9px] uppercase tracking-widest text-gold bg-gold/10 px-1.5 py-0.5 border border-gold/20 rounded">
            CMS
          </span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-[#222222] border border-[#333333] rounded text-stone hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* DRAWER MOBILE */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex">
          <div className="w-4/5 max-w-xs bg-[#171717] h-full flex flex-col p-5 space-y-4 border-r border-[#333333]">
            <div className="flex items-center justify-between pb-4 border-b border-[#2C2C2C]">
              <span className="font-mono text-xs text-gold uppercase tracking-wider font-bold">
                Menu Editorial
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-stone-dark hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1.5 flex-1 overflow-y-auto">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm ${
                      isActive ? "bg-gold text-night font-bold" : "text-stone hover:bg-[#252525]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-[#2C2C2C] space-y-2">
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-center gap-2 w-full py-2 bg-[#222222] rounded text-xs font-mono text-stone"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver Portal Público</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-2 w-full py-2 bg-red-950/40 border border-red-900/50 rounded text-xs font-mono text-red-300"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Encerrar Sessão</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#0F0F0F]">
        <div className="p-4 sm:p-8 max-w-6xl w-full mx-auto flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
