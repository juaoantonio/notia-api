## Arquitetura — Visão de Alto Nível

Diagrama atualizado com os principais componentes do Notia e seus fluxos.

```plantuml
@startuml
skinparam linetype ortho
skinparam componentStyle rectangle
skinparam packageStyle rectangle
skinparam shadowing false

' ===== Paleta aproximada dos "classes" Mermaid =====
skinparam component {
  BackgroundColor<<node>>  #0EA5E9
  BorderColor<<node>>      #0369A1
  FontColor<<node>>        white

  BackgroundColor<<infra>> #94A3B8
  BorderColor<<infra>>     #475569
  FontColor<<infra>>       white
}

' ===================== ÁREAS / PACOTES =====================
package "Frontend SPA (React 19 + Vite)" as Client {
  component "UI/Router" as UI <<node>>
}

package "Backend (Fastify + TypeScript + Zod)" as API {
  component "Rotas/Plugins" as RT <<node>>
  component "JWT em cookie httpOnly" as AUTH <<node>>
  component "Validação com Zod" as VAL <<node>>
  component "Serviços\n(Auth, Pastas, Links, Tags IA, Público)" as SVC <<node>>
  component "Logs (Pino) & Observabilidade" as LOG <<node>>
}

package "PostgreSQL (Neon/Supabase)" as DB {
  component "Prisma Client" as PRISMA <<infra>>
  database "PostgreSQL" as PG <<infra>>
}

cloud "OpenAI API" as IA {
  component "Serviço de sugestão de tags" as TAGS <<infra>>
}

' ===================== FLUXOS =====================
UI --> RT : fetch/axios
RT --> VAL
RT --> AUTH
RT --> SVC
SVC --> PRISMA
PRISMA --> PG
SVC --> TAGS : quando necessário
RT --> LOG

' ===================== LEGENDAS =====================
legend right
Autenticação: JWT assinado em cookie httpOnly; CORS restrito ao domínio do frontend.
Validação: Zod para requests/responses in

```

- Autenticação: JWT assinado em cookie httpOnly; CORS restrito ao domínio do frontend.
- Validação: Zod provê schemas para requests/responses, integrados ao Fastify.
- Persistência: Prisma como ORM type-safe para PostgreSQL gerenciado (Neon/Supabase).
- IA: Serviço externo da OpenAI para sugerir tags; com timeout e fallback.
- Observabilidade: logs estruturados (Pino) e métricas básicas de latência.


