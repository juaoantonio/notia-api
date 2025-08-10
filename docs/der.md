## DER — Modelo de Dados Principal

```mermaid
erDiagram
  USER ||--o{ FOLDER : owns
  FOLDER ||--o{ LINK : contains
  LINK }o--o{ TAG : tagged_as
  FOLDER ||--|| PUBLICSLUG : may_have
  USER ||--o{ EVENT : triggers
  FOLDER ||--o{ EVENT : relates
  LINK ||--o{ EVENT : relates

  USER {
    uuid id PK
    string email "unique"
    string passwordHash
    string name
    datetime createdAt
    datetime updatedAt
  }

  FOLDER {
    uuid id PK
    uuid ownerId FK "-> USER.id"
    string name
    string description
    boolean isPublic "default:false"
    datetime createdAt
    datetime updatedAt
  }

  LINK {
    uuid id PK
    uuid folderId FK "-> FOLDER.id"
    string url
    string title
    string description
    datetime createdAt
    datetime updatedAt
  }

  TAG {
    uuid id PK
    string name "unique"
    datetime createdAt
    datetime updatedAt
  }

  LINK_TAG {
    uuid linkId FK "-> LINK.id"
    uuid tagId FK "-> TAG.id"
    string source "manual|ai"
    PK "(linkId, tagId)"
  }

  PUBLICSLUG {
    uuid id PK
    uuid folderId FK "-> FOLDER.id unique"
    string slug "unique, non-guessable"
    boolean active "default:true"
    datetime createdAt
    datetime revokedAt "nullable"
  }

  EVENT {
    bigint id PK
    uuid userId FK "-> USER.id nullable"
    uuid folderId FK "-> FOLDER.id nullable"
    uuid linkId FK "-> LINK.id nullable"
    string eventType "CLICK|VISIT|SHARE|CREATE"
    jsonb meta
    timestamptz occurredAt
  }
```

Observações:
- `PUBLICSLUG.folderId` é único (uma pasta tem no máx. um slug ativo por vez).
- `LINK_TAG.source` indica se a tag foi sugerida pela IA ou definida manualmente.
- Índices recomendados: `User.email`, `Folder.ownerId`, `Link.folderId`, `PublicSlug.slug`.


