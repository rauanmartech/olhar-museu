"use client";

import Script from "next/script";
import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    VLibras?: {
      Widget: new (options: {
        rootPath: string;
        avatar?: string;
        position?: string;
        opacity?: number;
      }) => void;
    };
  }
}

declare module "react" {
  interface HTMLAttributes<T> extends React.DOMAttributes<T> {
    vw?: string;
    "vw-access-button"?: string;
    "vw-plugin-wrapper"?: string;
  }
}

export function VLibras() {
  const initialized = useRef(false);

  const initVLibras = () => {
    if (initialized.current) return;

    if (window.VLibras && typeof window.VLibras.Widget === "function") {
      try {
        new window.VLibras.Widget({
          rootPath: "https://vlibras.gov.br/app",
          avatar: "icaro",
          position: "R",
        });
        initialized.current = true;
      } catch (error) {
        console.error("Erro ao inicializar o VLibras Widget:", error);
      }
    }
  };

  useEffect(() => {
    if (window.VLibras && !initialized.current) {
      initVLibras();
    }
  }, []);

  return (
    <>
      <div vw="true" className="enabled">
        <div vw-access-button="true" className="active" />
        <div vw-plugin-wrapper="true">
          <div className="vw-plugin-top-wrapper" />
        </div>
      </div>
      <Script
        src="https://vlibras.gov.br/app/vlibras-plugin.js"
        strategy="afterInteractive"
        onLoad={initVLibras}
      />
    </>
  );
}
