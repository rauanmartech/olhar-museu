# Olhar Museu (por SiMOP) — Portal Editorial

Portal editorial e jornalístico independente sobre os museus, patrimônio histórico, arte sacra, exposições, memória e cultura de Ouro Preto.

## 🚀 Como Executar o Projeto

Este projeto é **100% independente** e pode ser executado em qualquer diretório isolado:

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em ambiente de desenvolvimento
npm run dev

# 3. Gerar build de produção
npm run build
```

O servidor de desenvolvimento estará disponível em `http://localhost:3001` (ou na porta configurada).

## 🏛️ Estrutura Editorial & Arquitetura

- `src/app/` — Rotas públicas com Next.js App Router (Home, Notícias, Artigo, Quem Somos, Categorias, Tags, Museus).
- `src/components/editorial/` — Componentes com design jornalístico contemporâneo (Super Manchete, Feed Cronológico, Blocos de Editoria, etc.).
- `src/components/layout/` — Masthead editorial, dropdown multinível com acessibilidade, drawer mobile e rodapé sóbrio.
- `src/lib/services/editorialService.ts` — Camada desacoplada de dados que opera atualmente com dados mockados e está pronta para receber a conexão do Supabase.
- `src/types/editorial.ts` — Contratos de tipos estritos espelhando o schema relacional do PostgreSQL/Supabase.
