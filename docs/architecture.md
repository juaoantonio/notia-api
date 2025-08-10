## Arquitetura — Visão de Alto Nível

Diagrama atualizado com os principais componentes do Notia e seus fluxos.

```mermaid
graph TD
  subgraph Client["Frontend SPA (React 19 + Vite)"]
    UI["UI/Router"]
  end

  subgraph API["Backend (Fastify + TypeScript + Zod)"]
    RT["Rotas/Plugins"]
    AUTH["JWT em cookie httpOnly"]
    VAL["Validação com Zod"]
    SVC["Serviços (Auth, Pastas, Links, Tags IA, Público)"]
    LOG["Logs (Pino) & Observabilidade"]
  end

  subgraph DB["PostgreSQL (Neon/Supabase)"]
    PG["PostgreSQL"]
    PRISMA["Prisma Client"]
  end

  subgraph IA["OpenAI API"]
    TAGS["Serviço de sugestão de tags"]
  end

  UI -->|fetch/axios| RT
  RT --> VAL
  RT --> AUTH
  RT --> SVC
  SVC --> PRISMA
  PRISMA --> PG
  SVC -->|quando necessário| TAGS
  RT --> LOG

  classDef node fill:#0ea5e9,stroke:#0369a1,color:#fff;
  classDef infra fill:#94a3b8,stroke:#475569,color:#fff;
  class UI,RT,AUTH,VAL,SVC,LOG node;
  class PRISMA,PG infra;
```

- Autenticação: JWT assinado em cookie httpOnly; CORS restrito ao domínio do frontend.
- Validação: Zod provê schemas para requests/responses, integrados ao Fastify.
- Persistência: Prisma como ORM type-safe para PostgreSQL gerenciado (Neon/Supabase).
- IA: Serviço externo da OpenAI para sugerir tags; com timeout e fallback.
- Observabilidade: logs estruturados (Pino) e métricas básicas de latência.


