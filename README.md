# 📋 Realtime Todo App

Una aplicación de tareas colaborativa en tiempo real construida con arquitectura moderna y principios SOLID. Permite a los usuarios gestionar tareas de forma colaborativa con sincronización en tiempo real a través de WebSockets.

## ✨ Características Principales

### 🔐 Sistema de Autenticación
- **Registro y login** con validación completa
- **JWT tokens** con refresh automático
- **Navegación protegida** y session management
- **Blacklist de tokens** para logout seguro

### 📝 Gestión de Tareas 
- **CRUD completo** de tareas
- **Sistema de prioridades** (LOW, MEDIUM, HIGH, URGENT)
- **Tipos de tareas** categorizados
- **Búsqueda y filtrado** avanzado
- **Paginación** automática

### ⚡ Tiempo Real
- **WebSocket** para sincronización instantánea
- **Eventos en tiempo real** (create, update, delete)
- **Conexión automática** y reconexión
- **Estados de sincronización** visuales

### 🌐 Características Avanzadas
- **Offline support** con cola de sincronización
- **Lazy loading** de pantallas
- **Animaciones fluidas** con Reanimated
- **Tema claro/oscuro** personalizable
- **Pull to refresh** con animaciones

### 🛡️ Seguridad y Performance
- **Rate limiting** configurado
- **Input sanitization** automático
- **Request logging** estructurado
- **CORS** configurado apropiadamente
- **Health checks** en producción

## 🛠️ Stack Tecnológico

### 🚀 Backend (NestJS)
- **NestJS** v10 - Framework Node.js con arquitectura modular
- **TypeScript** - Tipado estático y desarrollo robusto
- **PostgreSQL 15** - Base de datos relacional
- **Prisma** - ORM moderno con type-safety
- **JWT + Passport** - Autenticación y autorización
- **Socket.IO** - Comunicación WebSocket en tiempo real
- **class-validator** - Validación de DTOs
- **Jest** - Testing unitario y e2e
- **ThrottlerModule** - Rate limiting
- **Docker** - Containerización multi-stage

### 📱 Frontend (React Native)
- **React Native** - Framework móvil multiplataforma
- **Expo** v49 - Desarrollo y deployment
- **TypeScript** - Type safety en el cliente
- **React Navigation v6** - Navegación con lazy loading
- **Socket.IO Client** - WebSocket cliente
- **AsyncStorage** - Persistencia local
- **Axios** - Cliente HTTP con interceptors
- **React Context** - Estado global
- **Reanimated v3** - Animaciones de alto rendimiento
- **NetInfo** - Detección de conectividad

### 🐳 DevOps & Tools
- **Docker Compose** - Orquestación de contenedores
- **NGINX** - Proxy reverso (producción)
- **ESLint + Prettier** - Linting y formateo
- **GitHub Actions** ready - CI/CD pipeline
- **Multi-environment** - Dev, Staging, Production

## 🚀 Instalación y Setup

### Prerrequisitos
- **Node.js** v18+ 
- **Docker & Docker Compose**
- **Git**
- **Expo CLI** (para React Native): `npm install -g @expo/cli`

### 🐳 Opción 1: Docker (Recomendado)

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd realtime-todo-app

# 2. Configurar variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con tus configuraciones

# 3. Levantar todos los servicios
docker-compose up -d

# 4. Ver logs en tiempo real
docker-compose logs -f backend

# ✅ API disponible en: http://localhost:3000/api
# ✅ Health check: http://localhost:3000/api/health
```

### 💻 Opción 2: Desarrollo Local

#### Backend Setup
```bash
cd backend

# 1. Instalar dependencias
npm install

# 2. Configurar entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 3. Levantar base de datos
docker-compose up -d postgres

# 4. Ejecutar migraciones
npx prisma migrate dev
npx prisma generate

# 5. Ejecutar seeds (opcional)
npm run db:seed

# 6. Iniciar servidor de desarrollo
npm run start:dev

# ✅ Backend corriendo en: http://localhost:3000
```

#### Frontend Setup
```bash
cd frontend

# 1. Instalar dependencias
npm install

# 2. Configuración automática ✨
# La app detecta automáticamente tu IP local
# No necesitas configurar URLs manualmente

# 3. Iniciar Expo
npx expo start

# 4. Opciones de ejecución:
# - Presiona 'i' para iOS Simulator
# - Presiona 'a' para Android Emulator  
# - Escanea QR con Expo Go en tu móvil
```

### 🌍 Configuración para Evaluadores

```bash
# Levantar todo el sistema (recomendado)
docker-compose up -d

# Ver que todo esté funcionando
docker-compose ps
curl http://localhost:3000/api/health
```

## 🔗 URLs de Acceso

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **API Backend** | http://localhost:3000/api | - |
| **Health Check** | http://localhost:3000/api/health | - |
| **WebSocket** | ws://localhost:3000/socket.io | JWT required |
| **PostgreSQL** | localhost:5432 | Ver .env |
| **pgAdmin** | http://localhost:8080 | admin@todoapp.com / admin123 |
| **Expo App** | http://localhost:19006 | Auto-detectado |

## 🧪 Testing & Quality

### Backend Testing
```bash
cd backend

# Tests unitarios
npm run test

# Tests unitarios en modo watch
npm run test:watch

# Tests e2e completos
npm run test:e2e

# Coverage completo
npm run test:cov

# Linting y formato
npm run lint
npm run format

# Tests específicos
npm run test auth.service.spec.ts
npm run test:e2e auth.e2e-spec.ts
```

### Coverage Mínimo
- **Unitarios**: >80% líneas cubiertas ✅
- **E2E**: >70% flujos principales ✅
- **Integración**: Auth, Tasks, WebSocket ✅

### Tipos de Tests Incluidos
- **Auth Flow**: Register → Login → JWT → Logout
- **Task CRUD**: Create → Read → Update → Delete
- **WebSocket**: Real-time events y reconexión
- **Repository**: Database operations
- **Guards & Pipes**: Security y validation

## 📁 Estructura del Proyecto

```
realtime-todo-app/
├── 🚀 backend/              # NestJS API Server
│   ├── src/
│   │   ├── modules/          # Módulos de negocio
│   │   │   ├── auth/         # Autenticación JWT
│   │   │   ├── tasks/        # CRUD de tareas + WebSocket
│   │   │   ├── user/         # Gestión de usuarios
│   │   │   └── health/       # Health checks
│   │   ├── common/           # Código compartido
│   │   │   ├── filters/      # Exception filters
│   │   │   ├── pipes/        # Validation & sanitization
│   │   │   ├── guards/       # JWT & Auth guards
│   │   │   ├── middleware/   # Request logging
│   │   │   └── services/     # Services comunes
│   │   └── config/           # Configuración & env
│   ├── prisma/               # Database schema & migrations
│   ├── test/                 # Tests E2E & helpers
│   ├── Dockerfile            # Multi-stage Docker
│   └── docker-entrypoint.sh  # Init script
├── 📱 frontend/              # React Native App
│   ├── src/
│   │   ├── screens/          # Pantallas de la app
│   │   │   ├── auth/         # Login & Register
│   │   │   └── app/          # Task management
│   │   ├── components/       # Componentes reutilizables
│   │   ├── context/          # Estado global (Auth, Tasks, Theme)
│   │   ├── services/         # API clients & WebSocket
│   │   ├── navigation/       # React Navigation setup
│   │   ├── hooks/            # Custom hooks
│   │   ├── types/            # TypeScript definitions
│   │   └── utils/            # Helpers & constants
│   └── app.json              # Expo configuration
├── 🐳 Docker Files
│   ├── docker-compose.yml     # Basic setup
│   ├── docker-compose.dev.yml # Development
│   ├── docker-compose.prod.yml # Production + NGINX
│   └── DOCKER.md              # Docker documentation
└── 📚 Documentation
    ├── README.md              # Este archivo
    └── TASK.md               # Tracking de desarrollo
```

## 🔌 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Registro de usuario | ❌ |
| `POST` | `/api/auth/login` | Inicio de sesión | ❌ |
| `GET` | `/api/auth/profile` | Perfil del usuario logueado | ✅ JWT |
| `POST` | `/api/auth/logout` | Cerrar sesión (blacklist token) | ✅ JWT |

### 📝 Tasks Management
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/tasks` | Listar todas las tareas | ✅ JWT |
| `GET` | `/api/tasks/stats` | Estadísticas de tareas | ✅ JWT |
| `GET` | `/api/tasks/:id` | Obtener tarea específica | ✅ JWT |
| `POST` | `/api/tasks` | Crear nueva tarea | ✅ JWT |
| `PATCH` | `/api/tasks/:id` | Actualizar tarea | ✅ JWT |
| `DELETE` | `/api/tasks/:id` | Eliminar tarea | ✅ JWT |

### ⚡ WebSocket Events
| Event | Direction | Description | Payload |
|-------|-----------|-------------|---------|
| `task-created` | Server → Client | Nueva tarea creada | `Task` |
| `task-updated` | Server → Client | Tarea actualizada | `Task` |
| `task-deleted` | Server → Client | Tarea eliminada | `{id, task}` |
| `connection` | Client → Server | Cliente conectado | - |
| `disconnect` | Client → Server | Cliente desconectado | - |

### 🏥 Health & Monitoring
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/health` | Health check del sistema | ❌ |
| `GET` | `/health` | Health check simple | ❌ |

### 📊 Query Parameters (Tasks)
```typescript
GET /api/tasks?page=1&limit=10&search=texto&priority=HIGH&completed=false&sortBy=createdAt&sortOrder=desc
```

### 🔍 Task Filters
- **search**: Búsqueda por título/descripción
- **priority**: `LOW` | `MEDIUM` | `HIGH` | `URGENT`
- **type**: `FEATURE` | `BUG_FIX` | `REFACTOR` | etc.
- **completed**: `true` | `false`
- **sortBy**: `createdAt` | `updatedAt` | `title` | `priority`
- **sortOrder**: `asc` | `desc`

## 🗄️ Esquema de Base de Datos

### Modelo de Datos
```sql
-- Users (Usuarios del sistema)
User {
  id: String (PK, cuid)
  email: String (unique)
  password: String (hashed)
  name: String?
  createdAt: DateTime
  updatedAt: DateTime
  
  // Relaciones
  tasks: Task[] (1:N)
  completedTasks: Task[] (1:N, quien completó)
  taskStats: TaskStats[] (1:N)
}

-- Tasks (Tareas del sistema)
Task {
  id: String (PK, cuid)
  title: String
  description: String?
  completed: Boolean (default: false)
  priority: Priority (enum: LOW|MEDIUM|HIGH|URGENT)
  type: TaskType (enum: FEATURE|BUG_FIX|REFACTOR...)
  taskDate: DateTime
  startTime: DateTime?
  endTime: DateTime?
  completedAt: DateTime?
  createdAt: DateTime
  updatedAt: DateTime
  
  // Foreign Keys
  userId: String (FK → User.id)
  completedById: String? (FK → User.id)
  
  // Relaciones
  user: User (creador)
  completedBy: User? (quien la completó)
}

-- TaskStats (Estadísticas por usuario)
TaskStats {
  id: String (PK, cuid)
  userId: String (FK → User.id)
  date: DateTime
  tasksCompleted: Int
  tasksByType: Json
  tasksByPriority: Json
  totalHoursWorked: Float?
  averageCompletionTime: Float?
  createdAt: DateTime
  updatedAt: DateTime
  
  // Unique constraint: (userId, date)
}
```

### Relaciones Principales
- **User** → **Task**: 1:N (Un usuario puede crear muchas tareas)
- **User** → **Task** (completedBy): 1:N (Un usuario puede completar muchas tareas)
- **User** → **TaskStats**: 1:N (Estadísticas diarias por usuario)

### Índices y Constraints
- `users.email` UNIQUE
- `task_stats(userId, date)` UNIQUE
- Cascade delete: User → Tasks, TaskStats

## 🛠️ Desarrollo y Configuración

### Variables de Entorno Requeridas

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://JuPegro:Unicotrofeo1@localhost:5432/todoapp
DATABASE_TEST_URL=postgresql://JuPegro:Unicotrofeo1@localhost:5433/todoapp_test

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars-123456789
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development
HOST=0.0.0.0

# Database Connection Details (for Docker)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=todoapp
POSTGRES_USER=JuPegro
POSTGRES_PASSWORD=Unicotrofeo1

# CORS & Security
CORS_ORIGIN=http://localhost:19006,http://localhost:8081,http://192.168.68.104:19006

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_REQUESTS=100
```


#### Frontend (Opcional)
```env
# Si necesitas configurar puerto específico
EXPO_PUBLIC_API_PORT=3000

# Si necesitas IP específica (normalmente auto-detectada)
EXPO_PUBLIC_API_HOST=192.168.1.100
```

### 💻 Comandos Principales

#### Backend 
```bash
cd backend

# Desarrollo local (si no usas Docker)
npm run start:dev      # Modo desarrollo con hot-reload
npm run start:debug    # Con debugging habilitado

# Base de datos
npx prisma migrate dev       # Crear y aplicar migración
npx prisma migrate reset     # Reset completo de BD
npx prisma generate          # Regenerar cliente Prisma
npx prisma studio           # Interface visual de BD
npx prisma db push          # Push schema sin migración
npx prisma db seed          # Ejecutar seeds

# Testing
npm run test            # Tests unitarios
npm run test:watch      # Tests en modo watch
npm run test:e2e        # Tests end-to-end
npm run test:cov        # Coverage report
```

#### Docker Commands
```bash
# Desarrollo
docker-compose up -d                     # Todos los servicios
docker-compose logs -f backend           # Ver logs específicos
docker-compose exec backend bash         # Acceder al container

# Mantenimiento
docker-compose down -v --remove-orphans  # Limpiar completamente
docker-compose restart backend           # Reiniciar servicio
docker system prune -a --volumes        # Limpiar Docker
```

#### Frontend Commands
```bash
cd frontend

# Desarrollo
npm start              # Alias para expo start
npx expo start         # Servidor de desarrollo
npx expo start --clear # Con cache limpio
npx expo start --tunnel # Túnel para testing en dispositivos remotos

# Utilidades
npx expo install         # Instalar dependencias compatibles
npx expo doctor          # Diagnóstico de problemas
npm run web              # Ejecutar en navegador web
```

## 📱 Screenshots y Demo

### Pantallas Principales
*Screenshots de la aplicación serán agregados cuando esté ejecutándose*

#### Autenticación
- **Login Screen**: Formulario de ingreso con validación
- **Register Screen**: Registro de usuario con confirmación

#### Gestión de Tareas
- **Task List**: Lista principal con filtros y búsqueda
- **Add Task**: Modal para crear nueva tarea
- **Edit Task**: Edición en modal con datos pre-poblados

#### Características UX
- **Dark/Light Theme**: Toggle dinámico de tema
- **Offline Indicator**: Estado de conexión y sincronización
- **Pull to Refresh**: Animación customizada
- **Real-time Updates**: Sincronización automática

### Funcionalidades Implementadas
- **Flujo completo**: Registro → Login → CRUD tareas ✅
- **Tiempo real**: Sincronización vía WebSocket ✅
- **Offline support**: Funcionalidad sin conexión ✅

## 🎯 Decisiones Técnicas

### Backend Architecture
- **NestJS**: Framework robusto con decoradores y DI
- **Prisma**: ORM type-safe con migraciones automáticas
- **JWT**: Stateless auth con blacklist para logout
- **Socket.IO**: WebSocket para tiempo real
- **Repository Pattern**: Separación de lógica de negocio

### Frontend Architecture
- **React Context**: Estado global sin Redux
- **Lazy Loading**: Pantallas cargadas bajo demanda
- **Optimistic Updates**: UI responsiva con rollback
- **Offline First**: Cache + queue para sincronización
- **Reanimated**: Animaciones 60fps nativas

### Database Design
- **PostgreSQL**: ACID compliance para consistencia
- **CUID**: IDs únicos más seguros que UUID
- **Soft Relations**: Foreign keys con CASCADE delete
- **Enums**: Priority y TaskType para consistencia
- **JSON Fields**: TaskStats flexible sin tablas extra

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│  React Native   │    │    NestJS API   │    │   PostgreSQL    │
│                 │    │                 │    │                 │
│  - Expo App     │◄──►│  - REST + WS    │◄──►│  - Prisma ORM   │
│  - TypeScript   │    │  - JWT Auth     │    │  - Migrations   │
│  - Reanimated   │    │  - Rate Limit   │    │  - ACID Trans   │
│  - Offline      │    │  - Validation   │    │  - Backups      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌────▼────┐             ┌────▼────┐             ┌────▼────┐
    │  Users  │             │ Docker  │             │ pgAdmin │
    │ Mobile  │             │ Compose │             │  Web    │
    └─────────┘             └─────────┘             └─────────┘
```

### Flujo de Datos
1. **Auth Flow**: Login → JWT → Protected Routes
2. **Task CRUD**: UI → API → Database → WebSocket → UI
3. **Real-time**: Server Event → Socket.IO → Client Update
4. **Offline**: Cache → Queue → Sync when online

### WebSocket Events Flow
```
Client A                Server              Client B
   │                     │                    │
   ├── create task ────► │ ──────────────────► │
   │                     │ ◄── task-created ──┤
   │ ◄── task-created ───┤                    │
   │                     │                    │
   ├── update task ────► │ ──────────────────► │
   │                     │ ◄── task-updated ──┤
   │ ◄── task-updated ───┤                    │
```

## 🏆 Resumen de Funcionalidades Implementadas

### Backend ✅
- ✅ **API REST completa** con NestJS y TypeScript
- ✅ **Autenticación JWT** con registro, login y logout seguro
- ✅ **CRUD de tareas** con validaciones y filtros avanzados
- ✅ **WebSocket tiempo real** para sincronización colaborativa
- ✅ **Testing robusto** (>80% coverage unitario + E2E)
- ✅ **Seguridad** (rate limiting, sanitización, CORS)

### Frontend ✅
- ✅ **App React Native** con Expo y navegación completa
- ✅ **Interfaz intuitiva** con tema claro/oscuro
- ✅ **Tiempo real** con actualizaciones automáticas
- ✅ **Offline support** con cola de sincronización
- ✅ **Animaciones fluidas** y lazy loading
- ✅ **Manejo robusto de errores** y estados de carga

### DevOps ✅
- ✅ **Docker containerizado** para evaluación fácil
- ✅ **PostgreSQL** con pgAdmin para inspección
- ✅ **Health checks** y monitoring básico

## 🔍 Troubleshooting y Soporte

### Problemas Comunes

#### 🚨 Error de Conexión
```bash
# 1. Verificar que backend esté corriendo
curl http://localhost:3000/api/health

# 2. Verificar Docker containers
docker-compose ps

# 3. Ver logs detallados
docker-compose logs -f backend
```

```bash
# 1. Limpiar cache de Expo
npx expo start --clear

# 2. Verificar configuración automática
# La app detecta la IP del backend automáticamente

# 3. Error "Network Error"
# Verificar que backend esté en http://localhost:3000

# 4. Problemas de navegación
# Reinstalar dependencias de navegación
```

#### 🐳 Docker Issues
```bash
# 1. Puertos ocupados
docker-compose down
netstat -tulpn | grep :3000

# 2. Containers no inician
docker-compose up --build --force-recreate

# 3. Base de datos corrupta
docker-compose down -v
docker-compose up -d
```

#### 🔧 Database Issues
```bash
# 1. Migraciones fallando
npx prisma migrate reset --force
npx prisma migrate dev

# 2. Conexión perdida
docker-compose restart postgres
npx prisma generate
```

### Para Evaluadores
- **Health Check**: http://localhost:3000/api/health
- **Logs**: `docker-compose logs -f` para debugging
- **Testing**: `npm run test` (backend) para verificar coverage
- **pgAdmin**: http://localhost:8080 para inspeccionar BD

## 👨‍💻 Para Evaluadores de la Prueba Técnica

**Aplicación de Tareas Colaborativas** desarrollada con stack moderno full-stack:

### 🚀 Cómo Evaluar el Proyecto

1. **Setup rápido con Docker**:
   ```bash
   git clone <repo-url>
   cd realtime-todo-app
   docker-compose up -d
   ```

2. **Verificar que funciona**:
   - Backend: http://localhost:3000/api/health
   - pgAdmin: http://localhost:8080 (admin@todoapp.com / admin123)
   - Frontend: `cd frontend && npx expo start`

3. **Probar funcionalidades**:
   - Registro/Login de usuarios
   - CRUD completo de tareas
   - Sincronización en tiempo real (abrir en 2 dispositivos)
   - Tema claro/oscuro
   - Funcionalidad offline

4. **Verificar tests**:
   ```bash
   cd backend
   npm run test        # Tests unitarios
   npm run test:e2e    # Tests end-to-end
   npm run test:cov    # Coverage report
   ```

### Stack Implementado
- **Backend**: NestJS + TypeScript + Prisma + PostgreSQL + JWT + Socket.IO
- **Frontend**: React Native + Expo + TypeScript
- **Testing**: >80% coverage + E2E completo
- **Docker**: Setup automatizado para evaluación