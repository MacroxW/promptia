# Promptia

Aplicación de chat con IA utilizando Google Gemini, con autenticación, personalización de agente y herramientas.

## Autores

- **Marcos**
- **Mariano**

## Características

-  **Chat con IA**: Integración con Google Gemini 2.5 Flash
-  **Autenticación**: Sistema completo de login y registro con JWT
-  **Personalización del Agente**: 
  - System Prompt personalizable
  - Control de temperatura (0-2)
-  **Herramientas del Agente**:
  - Generación de imágenes (Pollinations AI)
  - Información del clima
-  **Gestión de Sesiones**: Múltiples conversaciones guardadas
-  **Interfaz Moderna**: UI responsive con Tailwind CSS y React Router
-  **Dark Mode**: Soporte completo para modo oscuro

## Estructura

```
├── apps/
│   ├── web/         # React + React Router + Vite
│   └── server/      # Express API + MongoDB
└── packages/        # Código compartido
    ├── types/       # TypeScript types
    ├── schemas/     # Zod schemas
    ├── utils/       # Helpers
    └── constants/   # Constantes
```

## Setup

```bash
# Instalar dependencias
pnpm install

# Setup database y variables de entorno
cp apps/server/.env.example apps/server/.env
# Editar .env con tus valores:
# - MONGODB_URI
# - GEMINI_API_KEY
# - JWT_SECRET

# Levantar MongoDB local (docker-compose)
pnpm --filter server docker:up

# Sembrar datos de prueba (usuario: user@gmail.com, password: password12345)
pnpm --filter server seed

# Desarrollo
pnpm dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## Comandos

```bash
pnpm dev                          # Correr todo (web + server)
pnpm dev:web                      # Solo frontend
pnpm dev:server                   # Solo backend
pnpm build                        # Build todo
pnpm --filter server docker:up    # Levantar MongoDB local
pnpm --filter server docker:down  # Apagar MongoDB local
pnpm --filter server seed         # Sembrar datos de prueba
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Login (devuelve JWT)

### Sesiones de Chat
- `GET /api/sessions` - Listar todas las sesiones del usuario
- `POST /api/sessions` - Crear nueva sesión
- `GET /api/sessions/:id` - Obtener sesión con historial de mensajes

### Chat
- `POST /api/chat/stream` - Enviar mensaje (respuesta en streaming)
  - Body: `{ message, sessionId, systemPrompt?, temperature? }`

## Stack Tecnológico

### Frontend
- React 19
- React Router 7
- Vite
- Tailwind CSS
- Zod 

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Google Gemini AI
- JWT para autenticación
- Server-Sent Events (SSE) para streaming

## Uso

1. **Registro/Login**: Accede a `/login` o `/register`
2. **Crear Sesión**: Haz clic en "Nuevo Chat" en el sidebar
3. **Personalizar Agente** (opcional):
   - Establece un System Prompt personalizado
   - Ajusta la temperatura para controlar creatividad
4. **Chatear**: Escribe mensajes y recibe respuestas en tiempo real
5. **Usar Herramientas**: 
   - "Genera una imagen de un atardecer"
   - "¿Cómo está el clima en Buenos Aires?"

## Características Técnicas

- **Autenticación reactiva**: El navbar se actualiza sin recargar la página
- **Route Protection**: React Router loaders para protección de rutas
- **Streaming**: Respuestas del agente en tiempo real vía SSE
- **Validación**: Schemas compartidos entre frontend y backend
- **Monorepo**: Gestión con pnpm workspaces
