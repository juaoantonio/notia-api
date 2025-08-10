## DER — Modelo de Dados Principal

```plantuml
@startuml
hide circle
skinparam linetype ortho

' ===================== ENTIDADES =====================

entity "USER" as USER {
  * id : uuid <<PK>>
  --
  email : string <<UQ>>
  passwordHash : string
  name : string
  createdAt : datetime
  updatedAt : datetime
}

entity "FOLDER" as FOLDER {
  * id : uuid <<PK>>
  --
  ownerId : uuid <<FK -> USER.id>>
  name : string
  description : string
  isPublic : boolean <<default:false>>
  createdAt : datetime
  updatedAt : datetime
}

entity "LINK" as LINK {
  * id : uuid <<PK>>
  --
  folderId : uuid <<FK -> FOLDER.id>>
  url : string
  title : string
  description : string
  createdAt : datetime
  updatedAt : datetime
}

entity "TAG" as TAG {
  * id : uuid <<PK>>
  --
  name : string <<UQ>>
  createdAt : datetime
  updatedAt : datetime
}

' Tabela de junção (chave composta)
entity "LINK_TAG" as LINK_TAG {
  ' Chave composta (linkId, tagId)
  * linkId : uuid <<FK -> LINK.id>>
  * tagId  : uuid <<FK -> TAG.id>>
  --
  source : string <<manual|ai>>
  ' PK: (linkId, tagId)
}

entity "PUBLICSLUG" as PUBLICSLUG {
  * id : uuid <<PK>>
  --
  folderId : uuid <<FK -> FOLDER.id, UQ>>
  slug : string <<UQ, non-guessable>>
  active : boolean <<default:true>>
  createdAt : datetime
  revokedAt : datetime <<nullable>>
}

entity "EVENT" as EVENT {
  * id : bigint <<PK>>
  --
  userId   : uuid <<FK -> USER.id, nullable>>
  folderId : uuid <<FK -> FOLDER.id, nullable>>
  linkId   : uuid <<FK -> LINK.id, nullable>>
  eventType : string <<CLICK|VISIT|SHARE|CREATE>>
  meta : jsonb
  occurredAt : timestamptz
}

' ===================== RELACIONAMENTOS =====================

USER   ||--o{ FOLDER : owns
FOLDER ||--o{ LINK   : contains

' relacionamento N..M direto (mantido como no Mermaid)
LINK   }o--o{ TAG    : tagged_as

' também representando a tabela de junção explicitamente
LINK   ||--o{ LINK_TAG
TAG    ||--o{ LINK_TAG

' uma pasta pode ter no máx. um slug (ativo) por vez
FOLDER ||--|| PUBLICSLUG : may_have

USER   ||--o{ EVENT  : triggers
FOLDER ||--o{ EVENT  : relates
LINK   ||--o{ EVENT  : relates

' ===================== ÍNDICES RECOMENDADOS (notas) =====================
note right of USER
  Índice recomendado:
  - USER.email
end note

note right of FOLDER
  Índice recomendado:
  - FOLDER.ownerId
end note

note right of LINK
  Índice recomendado:
  - LINK.folderId
end note

note right of PUBLICSLUG
  Índices recomendados:
  - PUBLICSLUG.slug
  - PUBLICSLUG.folderId (único)
end note

@enduml
```

Observações:
- `PUBLICSLUG.folderId` é único (uma pasta tem no máx. um slug ativo por vez).
- `LINK_TAG.source` indica se a tag foi sugerida pela IA ou definida manualmente.
- Índices recomendados: `User.email`, `Folder.ownerId`, `Link.folderId`, `PublicSlug.slug`.


