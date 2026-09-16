"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Lock, Mail, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirectTo") || "/admin";
  const redirectTo =
    rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") && !rawRedirect.includes("://")
      ? rawRedirect
      : "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    // Verifica se já está logado
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.replace(redirectTo);
      }
    };
    checkUser();
  }, [router, redirectTo, supabase]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMessage("E-mail ou senha incorretos. Por favor, verifique seus dados.");
        } else {
          setErrorMessage(error.message || "Erro ao autenticar. Tente novamente.");
        }
        return;
      }

      if (data.user) {
        router.refresh();
        router.push(redirectTo);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#121212] flex flex-col justify-between text-[#FAF7F2] selection:bg-gold selection:text-night relative overflow-hidden font-sans">
      {/* Detalhes de Fundo / Estilo Ouro Preto */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#C99A45_1px,transparent_1px)] [background-size:24px_24px]"></div>
      
      {/* Topo / Voltar */}
      <header className="p-6 max-w-7xl mx-auto w-full flex items-center justify-between relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-stone-dark hover:text-gold transition-colors uppercase tracking-widest"
        >
          ← Voltar ao Portal Público
        </Link>
        <span className="font-mono text-[11px] text-gold/80 px-2.5 py-1 border border-gold/30 rounded bg-gold/10">
          Acesso Editorial SiMOP
        </span>
      </header>

      {/* Caixa Central de Login */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10 my-8">
        <div className="w-full max-w-md bg-[#1B1B1B] border border-[#333333] shadow-2xl p-8 sm:p-10 relative">
          {/* Tarja Dourada Superior */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-light" />

          {/* Cabeçalho do Card */}
          <div className="text-center space-y-4 mb-8">
            <div className="flex justify-center">
              <Image
                src="/images/olhar-museu-logo-completa-branca.webp"
                alt="Olhar Museu"
                width={260}
                height={80}
                className="h-14 w-auto object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-tight">
                Redação Editorial
              </h1>
              <p className="text-stone-dark text-xs sm:text-sm mt-1 font-sans">
                Acesse o painel para gerenciar publicações, exposições e acervos.
              </p>
            </div>
          </div>

          {/* Alerta de Erro */}
          {errorMessage && (
            <div className="mb-6 p-3.5 bg-red-950/60 border border-red-800/80 rounded text-red-200 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Formulário de Login */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block font-mono text-xs text-stone uppercase tracking-wider mb-2 font-medium">
                E-mail Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-dark">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jornalista@olharmuseu.com.br"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#121212] border border-[#3A3A3A] text-white text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-sans placeholder:text-stone-dark/60 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono text-xs text-stone uppercase tracking-wider font-medium">
                  Senha de Acesso
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-dark">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#121212] border border-[#3A3A3A] text-white text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-sans placeholder:text-stone-dark/60 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gold hover:bg-gold-light text-night font-bold font-sans text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Painel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Dica de Segurança */}
          <div className="mt-8 pt-6 border-t border-[#2E2E2E] text-center">
            <p className="font-mono text-[11px] text-stone-dark">
              Ambiente protegido e restrito à equipe editorial do SiMOP.
            </p>
          </div>
        </div>
      </div>

      {/* Rodapé Sóbrio */}
      <footer className="p-6 text-center text-[11px] font-mono text-stone-dark border-t border-[#222222] relative z-10">
        © 2026 Olhar Museu por SiMOP · Sistema de Museus de Ouro Preto
      </footer>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}

