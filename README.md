# Promptia

Aplicación de chat con LLM usando Expo (React Native) + Node.js + Express + MongoDB (driver oficial).

## Estructura
```
├── apps/
│   ├── mobile/      # Expo app
│   └── server/      # Express API
└── packages/        # Código compartido
    ├── database/    # Cliente MongoDB
    ├── types/       # TypeScript types
    ├── schemas/     # Zod schemas
    ├── utils/       # Helpers
    └── constants/   # Constantes
```

## Setup
```bash
# Instalar dependencias
pnpm install

# Setup database
cp apps/server/.env.example apps/server/.env
# Editar .env con tus valores (MONGODB_URI, GEMINI_API_KEY, etc.)

# Levantar MongoDB local (usa docker-compose por defecto)
pnpm --filter server docker:up

# Desarrollo
pnpm dev
```

## Comandos
```bash
pnpm dev              # Correr todo
pnpm dev:mobile       # Solo mobile
pnpm dev:server       # Solo server
pnpm test             # Tests
pnpm build            # Build todo
pnpm --filter server docker:up   # Levantar Mongo local
pnpm --filter server docker:down # Apagar Mongo local
```

## API rápida
- `POST /auth/register` / `POST /auth/login`: alta y autenticación de usuarios (devuelve JWT).
- `GET /sessions` / `POST /sessions`: listar o crear sesiones de chat.
- `GET /sessions/:id`: obtiene una sesión con su historial de mensajes.
- `POST /chat/:sessionId`: envía un mensaje del usuario, llama a Gemini y guarda la respuesta del asistente.
