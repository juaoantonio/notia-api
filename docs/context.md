# Documento de Contexto da Aplicação — Notia

## Contexto e Visão Geral
O **Notia** é uma aplicação web responsiva para salvar, organizar e compartilhar links de estudo, voltada para estudantes, concurseiros, professores e autodidatas. No cenário atual, muitos usuários recorrem a anotações dispersas, bookmarks de navegador ou arquivos offline para armazenar conteúdos, o que dificulta busca, categorização e compartilhamento.

A hipótese de valor é que, ao integrar **Inteligência Artificial** para sugerir tags automaticamente e fornecer uma experiência de uso fluida, o Notia aumentará a produtividade e facilitará a organização de materiais, além de abrir oportunidades de monetização via modelo freemium/premium.

## Problema a ser resolvido
Atualmente, a organização de links de estudo é:
- **Manual e demorada:** exige que o usuário crie categorias e tags sozinho.
- **Pouco acessível:** os links ficam restritos ao dispositivo ou navegador.
- **Sem métricas:** não há insights de uso ou popularidade.
- **Baixa colaboração:** dificuldade de compartilhar coleções de forma controlada.

**Como será com o Notia:**
- Sugestões automáticas de tags por IA reduzem esforço.
- Pastas privadas por padrão, com opção de compartilhamento seguro.
- Interface responsiva e otimizada para buscas e filtragens.
- Recursos futuros ampliam valor (estatísticas, backup, PWA).

## Objetivos e Resultados Esperados

| Métrica                          | Baseline | Meta                  | Prazo         |
|----------------------------------|----------|-----------------------|---------------|
| Tempo médio para cadastrar link  | >60s     | ≤30s                  | MVP + 1 mês   |
| Usuários ativos mensais (MAU)    | 0        | ≥500                  | 1º mês pós-MVP|
| Conversão para Premium           | 0%       | ≥5%                    | 3 meses       |
| Tempo de resposta médio da API   | N/D      | ≤300ms                 | Lançamento    |
| NPS                              | N/D      | ≥50                    | 3 meses       |

## Escopo e principais funcionalidades

**Incluído no MVP:**
- **Autenticação (e-mail/senha, OAuth Google, recuperação)** — Controle de acesso seguro; aceito quando login e sessão persistem via cookie httpOnly.
- **Pastas (CRUD + visibilidade)** — Organização hierárquica; aceito quando pastas privadas/públicas funcionam com ícones de status.
- **Links (CRUD + validação)** — Inclusão e edição de links com validação de URL; aceito quando a persistência e exibição funcionam sem erro.
- **Sugestão de tags por IA** — Automação via OpenAI; aceito quando tags sugeridas são relevantes >80% dos casos.
- **Compartilhamento público de pastas** — Slug único revogável; aceito quando revogação bloqueia acesso imediato.
- **Conta e configurações** — Edição de perfil e senha; aceito quando alterações refletem em tempo real.

**Fora de escopo inicial (planejado para fases futuras):**
- Upload de anexos — Depende de storage e regras de quota.
- Backup automático — Depende de integrações OAuth com nuvem.
- Estatísticas de uso — Depende de coleta e agregação de eventos.
- Exportação PDF/Excel — Depende de bibliotecas de formatação.
- Busca semântica — Depende de embeddings e infraestrutura vetorial.
- PWA offline — Depende de service worker e cache de dados.

## Arquitetura e abordagem
**Visão de alto nível:**
- **Frontend:** React 19 + Vite, Tailwind CSS v4, shadcn/ui, TanStack Router; TanStack Query para dados; motion.dev para animações.
- **Backend:** Fastify (Node.js) + Prisma + PostgreSQL (Neon/Supabase); validação com Zod; autenticação JWT em cookies httpOnly; integração com OpenAI API.
- **Infra:** Deploy FE (Vercel/Netlify) e BE (Railway/Render); CI/CD com builds e testes automáticos.

**Decisões arquiteturais (ADR curtas):**
- **Autenticação:** JWT em cookie httpOnly para segurança contra XSS; alternativa descartada: localStorage (risco de exposição).
- **Banco de dados:** PostgreSQL pela robustez e suporte a PGVector; alternativa descartada: MongoDB (menor adequação a queries relacionais).
- **Sugestões por IA:** API da OpenAI pela rapidez de integração; alternativa: modelo local (mais custo infra).
- **Estilo:** Tailwind CSS para produtividade e consistência; alternativa: CSS Modules (menos flexível para design system global).

**Qualidade:**
- **Segurança:** TLS, criptografia em repouso, rate limiting, validação de entrada.
- **Observabilidade:** logs estruturados (Pino), métricas de latência, monitoramento de erros.
- **Desempenho:** Respostas ≤300ms; UI com carregamento otimista.
- **Escalabilidade:** Serviços stateless, horizontal scaling.

```
[Browser] -> [Frontend SPA React]
               |
               v
         [Fastify API]
               |
        [PostgreSQL DB]
               |
          [OpenAI API]
```

## Dependências, Restrições e Riscos

**Dependências:**

| Item                       | Responsável/Origem | Impacto                   | Status   |
|----------------------------|--------------------|---------------------------|----------|
| API OpenAI                 | OpenAI             | Sugestão de tags IA       | Pendente |
| Serviço OAuth Google       | Google             | Login social              | Pendente |
| Hospedagem backend         | Railway/Render     | Disponibilidade do sistema| Pendente |
| Hospedagem frontend        | Vercel/Netlify     | Acesso ao app             | Pendente |
| Banco gerenciado Postgres  | Neon/Supabase      | Persistência de dados     | Pendente |

**Restrições:**
- [Assunção] Orçamento inicial limitado — foco em serviços com tier gratuito.
- Entrega do MVP em até 8 semanas.
- Requisitos de segurança: criptografia em trânsito e repouso obrigatórias.

**Riscos:**

| Risco                           | Prob./Impacto | Mitigação                                   | Gatilhos                       |
|---------------------------------|---------------|---------------------------------------------|---------------------------------|
| Atraso na integração de IA      | M/M           | Planejar fallback sem IA                    | API instável ou lenta           |
| Custos elevados da API OpenAI   | M/M           | Monitorar uso, cache de respostas           | Volume de requisições cresce    |
| Baixa adesão de usuários        | M/A           | Estratégia de marketing e onboarding        | Menos de 200 MAU no 1º mês      |
| Problemas de performance        | M/A           | Testes de carga e índices no banco          | Latência >500ms em endpoints    |

---

## Tabela de rastreabilidade

| Objetivo                                    | Funcionalidade                       | Métrica                      |
|---------------------------------------------|---------------------------------------|------------------------------|
| Reduzir tempo de cadastro                   | Sugestão de tags IA                   | ≤30s por link                |
| Aumentar base de usuários                   | Auth, Pastas, Links, Compartilhamento | ≥500 MAU                     |
| Converter usuários para Premium             | Recursos futuros (backup, stats, etc.)| ≥5% conversão                 |
| Garantir desempenho                         | Backend otimizado, índices DB         | ≤300ms resposta API           |
| Melhorar satisfação do usuário              | UX responsiva, carregamento otimista  | NPS ≥50                       |

---

## Glossário
- **MVP:** Produto Mínimo Viável.  
- **MAU:** Monthly Active Users (usuários ativos mensais).  
- **NPS:** Net Promoter Score.  
- **PGVector:** Extensão PostgreSQL para busca vetorial.  
- **PWA:** Progressive Web App.  
