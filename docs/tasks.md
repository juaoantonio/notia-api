# Notia — Plano de Tarefas (Backend)

## Objetivo do Backend
APIs seguras, rápidas (≈300ms), escaláveis e bem testadas para: autenticação, pastas, links, tags via IA, compartilhamento público e recursos futuros (anexos, backup, estatísticas, exportação, busca semântica).

## Macroetapas (Árvore de pensamentos)
1. Arquitetura & Setup
2. MVP de APIs
3. Qualidade, Segurança & Deploy
4. Funcionalidades Futuras

---

## Fase 1 — Arquitetura & Setup

### [x] Tarefa B1.1 — Definir arquitetura e modelo de dados
- **Objetivo:** Diagramar serviços, fluxos e schema (Usuário, Pasta, Link, Tag, Slug público, Eventos/Stats).
- **Pré-requisitos:** PRD validado.
- **Critério de conclusão:** DER aprovado; decisões registradas (JWT em cookie httpOnly, RBAC básico).
- **Estimativa:** 1 dia • **Prioridade:** Alta
- **Checklist de validação:**
  - [x] Diagrama de arquitetura compartilhado (link no repositório)
  - [x] DER contendo entidades e relações principais
  - [x] Decisões registradas (doc ADR) sobre autenticação, RBAC, escalabilidade

### [x] Tarefa B1.2 — Inicializar projeto Fastify + TypeScript + Zod
- **Objetivo:** Skeleton com Fastify, TS `strict`, Zod, estrutura de módulos.
- **Pré-requisitos:** B1.1.
- **Critério de conclusão:** `/health` responde; ESLint/Prettier sem erros.
- **Estimativa:** 0,5 dia • **Prioridade:** Alta
- **Checklist de validação:**
  - [x] Endpoint `/health` ativo
  - [x] TS `strict` habilitado
  - [x] ESLint/Prettier configurados e passando no CI

### [x] Tarefa B1.3 — Postgres (Neon/Supabase) + Prisma
- **Objetivo:** Conectar DB, definir `schema.prisma`, migrations iniciais.
- **Pré-requisitos:** B1.1.
- **Critério de conclusão:** Migrations aplicadas; seed básico ok.
- **Estimativa:** 1 dia • **Prioridade:** Alta
- **Checklist de validação:**
  - [x] Variáveis de ambiente do DB configuradas
  - [x] `prisma migrate deploy` executa sem erros
  - [x] Script de seed inserindo dados mínimos

### [ ] Tarefa B1.4 — Autenticação base (JWT httpOnly)
- **Objetivo:** `fastify-jwt`, geração/validação, expiração/refresh.
- **Pré-requisitos:** B1.2, B1.3.
- **Critério de conclusão:** Hook de auth protege rotas; cookies httpOnly emitidos.
- **Estimativa:** 0,5 dia • **Prioridade:** Alta
- **Checklist de validação:**
  - [ ] Assinatura/validação JWT funcionando
  - [ ] Cookie `httpOnly; secure; sameSite` configurado
  - [ ] Middleware/Hook bloqueando rotas privadas

### [ ] Tarefa B1.5 — Observabilidade mínima (logs/metrics)
- **Objetivo:** Pino para logs estruturados, timing e request-id.
- **Pré-requisitos:** B1.2.
- **Critério de conclusão:** Logs correlacionáveis; métricas básicas de latência.
- **Estimativa:** 0,5 dia • **Prioridade:** Média
- **Checklist de validação:**
  - [ ] Request-id em cada log
  - [ ] Tempo de resposta por rota logado
  - [ ] Níveis de log (info/warn/error) padronizados

---

## Fase 2 — MVP de APIs

### [ ] Tarefa B2.1 — Autenticação completa (e-mail/senha, OAuth Google, recuperação)
- **Objetivo:** `POST /auth/register|login|logout`, OAuth Google, `POST /auth/forgot|reset`.
- **Pré-requisitos:** B1.4, B1.3.
- **Critério de conclusão:** Fluxos funcionais; senhas hash; e-mails ok.
- **Estimativa:** 2 dias • **Prioridade:** Alta
- **Checklist de validação:**
  - [ ] Registro e login retornam cookie de sessão
  - [ ] Senhas com bcrypt/argon2
  - [ ] Recuperação de senha com token de uso único e expiração
  - [ ] OAuth Google configurado e testado

### [ ] Tarefa B2.2 — Perfil/Conta
- **Objetivo:** `GET/PUT /me`, `PUT /me/password`.
- **Pré-requisitos:** B2.1.
- **Critério de conclusão:** Atualiza perfil/senha; erros padronizados.
- **Estimativa:** 0,5 dia • **Prioridade:** Média
- **Checklist de validação:**
  - [ ] Atualização de perfil persiste no DB
  - [ ] Troca de senha exige senha atual
  - [ ] Erros com códigos e mensagens consistentes

### [ ] Tarefa B2.3 — Pastas (CRUD + visibilidade)
- **Objetivo:** `POST/GET/PUT/DELETE /folders`, campo `isPublic`.
- **Pré-requisitos:** B1.3, B2.1.
- **Critério de conclusão:** Permissões por dono; private por padrão.
- **Estimativa:** 1 dia • **Prioridade:** Alta
- **Checklist de validação:**
  - [ ] Criação/edição/remoção restritas ao dono
  - [ ] `isPublic` padrão `false`
  - [ ] Respostas paginadas quando necessário

### [ ] Tarefa B2.4 — Links (CRUD) + validação de URL
- **Objetivo:** `POST/GET/PUT/DELETE /folders/:id/links`, validação URL.
- **Pré-requisitos:** B2.3.
- **Critério de conclusão:** Operações ≤300ms median; dados corretos.
- **Estimativa:** 1 dia • **Prioridade:** Alta
- **Checklist de validação:**
  - [ ] Regex/URL parser no backend
  - [ ] Aninhamento correto por pasta
  - [ ] P95 de latência monitorado

### [ ] Tarefa B2.5 — Serviço de tags por IA
- **Objetivo:** Endpoint que recebe título/descrição e retorna 3–8 tags.
- **Pré-requisitos:** B2.4; credenciais IA.
- **Critério de conclusão:** Timeout/retentativas; queda graciosa.
- **Estimativa:** 1 dia • **Prioridade:** Alta
- **Checklist de validação:**
  - [ ] Chave da IA em segredo/ENV
  - [ ] Requisições com timeout e retry
  - [ ] Fallback sem travar fluxo de criação de link

### [ ] Tarefa B2.6 — Compartilhamento público (slug + revogação)
- **Objetivo:** Slug único por pasta; endpoints read-only públicos.
- **Pré-requisitos:** B2.3.
- **Critério de conclusão:** `GET /public/:slug` funcional; revogação imediata.
- **Estimativa:** 1 dia • **Prioridade:** Alta
- **Checklist de validação:**
  - [ ] Slug único e não adivinhável
  - [ ] Endpoint não expõe dados privados
  - [ ] Revogar invalida acesso imediatamente

### [ ] Tarefa B2.7 — Camada de erros e contratos
- **Objetivo:** Middleware de erro, DTOs, paginação.
- **Pré-requisitos:** B2.1–B2.6.
- **Critério de conclusão:** Respostas consistentes e documentadas.
- **Estimativa:** 0,5 dia • **Prioridade:** Alta
- **Checklist de validação:**
  - [ ] Formato de erro padronizado (código, mensagem, detalhes)
  - [ ] DTOs validados com Zod
  - [ ] Paginação/ordenção padronizadas

---

## Fase 3 — Qualidade, Segurança & Deploy

### [ ] Tarefa B3.1 — Testes (unit/integration/E2E de API)
- **Objetivo:** Vitest/supertest para fluxos críticos.
- **Pré-requisitos:** Fase 2.
- **Critério de conclusão:** Cobertura >70%; CI verde.
- **Estimativa:** 2 dias • **Prioridade:** Alta
- **Checklist de validação:**
  - [ ] Testes auth, folders, links, público
  - [ ] Seeds/mocks para cenários comuns
  - [ ] Pipeline executa testes em PR

### [ ] Tarefa B3.2 — Hardening de segurança
- **Objetivo:** Rate limit, headers, CORS, OWASP checks.
- **Pré-requisitos:** B2.7.
- **Critério de conclusão:** Sem críticas em scanner; segredos seguros.
- **Estimativa:** 1 dia • **Prioridade:** Alta
- **Checklist de validação:**
  - [ ] Rate limit por IP/usuário
  - [ ] CSP/CORS configurados
  - [ ] Senhas/token storage revisados

### [ ] Tarefa B3.3 — Performance & índices
- **Objetivo:** Índices (userId, slug), pool/tuning, N+1.
- **Pré-requisitos:** B2.4–B2.6.
- **Critério de conclusão:** p95 ≤ 300–400ms.
- **Estimativa:** 1 dia • **Prioridade:** Alta
- **Checklist de validação:**
  - [ ] Índices criados e verificados
  - [ ] Queries analisadas (EXPLAIN)
  - [ ] Monitoramento de latência por rota

### [ ] Tarefa B3.4 — CI/CD & Deploy (Railway/Render)
- **Objetivo:** Pipelines, migrations automáticas, envs.
- **Pré-requisitos:** B3.1.
- **Critério de conclusão:** Deploy por merge em main; rollback.
- **Estimativa:** 1 dia • **Prioridade:** Média
- **Checklist de validação:**
  - [ ] Build/test em PR e main
  - [ ] Deploy automático com migrations
  - [ ] Processo de rollback documentado

### [ ] Tarefa B3.5 — Documentação de API (OpenAPI/Swagger)
- **Objetivo:** Spec e UI para testes.
- **Pré-requisitos:** B2.7.
- **Critério de conclusão:** `/docs` disponível; cobertura de endpoints.
- **Estimativa:** 0,5 dia • **Prioridade:** Média
- **Checklist de validação:**
  - [ ] Spec OpenAPI versionada
  - [ ] Swagger UI acessível protegido
  - [ ] Exemplos de requests/responses

---

## Fase 4 — Funcionalidades Futuras

### [ ] Tarefa B4.1 — Upload de anexos (S3/compatível)
- **Objetivo:** Upload seguro; ligação a Link.
- **Pré-requisitos:** B2.4.
- **Critério de conclusão:** Tipos/tamanhos validados.
- **Estimativa:** 2 dias • **Prioridade:** Média
- **Checklist de validação:**
  - [ ] Presigned URL / streaming implementado
  - [ ] Validação de MIME e tamanho
  - [ ] Links de download com expiração

### [ ] Tarefa B4.2 — Backup Google Drive/Dropbox
- **Objetivo:** OAuth; job de export JSON/CSV.
- **Pré-requisitos:** B4.4, credenciais.
- **Critério de conclusão:** Botão e agendamento com logs.
- **Estimativa:** 3 dias • **Prioridade:** Alta
- **Checklist de validação:**
  - [ ] Fluxo OAuth completo
  - [ ] Arquivo gerado com dados do usuário
  - [ ] Log/alerta de sucesso/falha

### [ ] Tarefa B4.3 — Estatísticas (eventos e agregações)
- **Objetivo:** Registrar cliques/visitas; agregações.
- **Pré-requisitos:** B2.6.
- **Critério de conclusão:** `/stats` por user/pasta/link.
- **Estimativa:** 1,5 dia • **Prioridade:** Alta
- **Checklist de validação:**
  - [ ] Tabela de eventos ou contadores
  - [ ] Agregações por período
  - [ ] Proteção de privacidade (sem PII desnecessária)

### [ ] Tarefa B4.4 — Exportação (CSV/Excel/PDF)
- **Objetivo:** Endpoints para export.
- **Pré-requisitos:** B2.4.
- **Critério de conclusão:** Download rápido e correto.
- **Estimativa:** 1 dia • **Prioridade:** Alta
- **Checklist de validação:**
  - [ ] CSV/Excel com colunas padronizadas
  - [ ] PDF com layout limpo
  - [ ] Teste com volumes grandes

### [ ] Tarefa B4.5 — Busca semântica (embeddings + PGVector)
- **Objetivo:** Armazenar embeddings; similaridade.
- **Pré-requisitos:** IA disponível; PGVector.
- **Critério de conclusão:** `/search` com relevância semântica.
- **Estimativa:** 3 dias • **Prioridade:** Média
- **Checklist de validação:**
  - [ ] Pipeline para gerar embeddings
  - [ ] Índice vetorial configurado
  - [ ] Avaliação de precisão (casos de teste)

### [ ] Tarefa B4.6 — Quotas e rate limits freemium/premium
- **Objetivo:** Limitar pastas/links/IA por plano.
- **Pré-requisitos:** B2.x.
- **Critério de conclusão:** Respostas 429/403 coerentes.
- **Estimativa:** 1 dia • **Prioridade:** Média
- **Checklist de validação:**
  - [ ] Regras por plano armazenadas
  - [ ] Métricas por usuário/uso de IA
  - [ ] Mensagens claras ao atingir limites
