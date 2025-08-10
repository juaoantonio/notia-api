# Plano de Ação Macro — Backend Notia

## Planejamento e Arquitetura
- Validar escopo, modelo de dados e arquitetura geral do sistema.
- Configurar repositório, ambiente e ferramentas (Fastify + TS + Zod + Prisma + Postgres).
- Definir padrões de segurança, logs e monitoramento inicial.

## Implementação do MVP de APIs
- Construir autenticação completa (e-mail/senha, OAuth Google, recuperação de senha).
- Desenvolver APIs para perfil/conta, gerenciamento de pastas e links com validação de URL.
- Integrar serviço de IA para sugestão de tags.
- Criar mecanismo de compartilhamento público com slug único e revogação.
- Padronizar contratos de API e tratamento de erros.

## Qualidade, Segurança e Deploy
- Escrever testes unitários, de integração e E2E para fluxos críticos.
- Realizar hardening de segurança (rate limit, headers, CORS, validações).
- Otimizar performance e aplicar índices no banco de dados.
- Configurar CI/CD e pipelines de deploy automatizado.
- Documentar a API (OpenAPI/Swagger).

## Funcionalidades Futuras
- Implementar upload seguro de anexos (PDF/DOC) com storage na nuvem.
- Criar sistema de backup automático em Google Drive/Dropbox.
- Adicionar estatísticas de uso e agregações por pasta/link.
- Implementar exportação de dados em CSV/Excel/PDF.
- Adicionar busca semântica com embeddings e PGVector.
- Configurar quotas e rate limits diferenciados para planos freemium e premium.
