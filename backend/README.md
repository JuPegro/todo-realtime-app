# 🚀 Backend - NestJS API

API REST construida con NestJS que proporciona autenticación JWT, gestión de tareas colaborativas y comunicación en tiempo real vía WebSocket.

## 📋 Descripción

Backend completo para aplicación de tareas colaborativas con:
- **Autenticación JWT** con blacklist de tokens
- **CRUD de tareas** con filtrado y paginación avanzada
- **WebSocket en tiempo real** para sincronización colaborativa
- **Rate limiting** y sanitización de inputs
- **Testing completo** (unitarios + E2E) con >80% coverage

## 🏗️ Arquitectura

### Módulos Principales
- **AuthModule**: JWT authentication, registro/login, blacklist
- **TasksModule**: CRUD completo + WebSocket Gateway  
- **UserModule**: Gestión de usuarios
- **HealthModule**: Health checks y monitoring

### Servicios Compartidos
- **PrismaService**: ORM connection y configuración
- **OwnershipValidationService**: Validación de permisos
- **TokenBlacklistService**: Invalidación de JWT tokens

## ⚙️ Instalación y Configuración

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

### 3. Configurar Base de Datos
```bash
# Con Docker
docker-compose up -d postgres

# Ejecutar migraciones
npx prisma migrate dev
npx prisma generate

# (Opcional) Ejecutar seeds
npm run db:seed
```

## 🚀 Ejecución

### Desarrollo
```bash
# Modo development con hot-reload
npm run start:dev

# Con debugging habilitado
npm run start:debug

# Ver logs de base de datos
DATABASE_LOGGING=true npm run start:dev
```


## 🧪 Testing

### Tests Unitarios
```bash
# Ejecutar todos los tests
npm run test

# Modo watch
npm run test:watch

# Test específico
npm run test auth.service.spec.ts

# Con coverage
npm run test:cov
```

### Tests E2E
```bash
# Tests end-to-end completos
npm run test:e2e

# Test específico E2E
npm run test:e2e auth.e2e-spec.ts
```

### Coverage Actual
- **Líneas**: >80% ✅
- **Funciones**: >85% ✅  
- **Branches**: >75% ✅
- **Statements**: >80% ✅

## 🔌 API Endpoints

### 🔐 Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Perfil del usuario (JWT required)
- `POST /api/auth/logout` - Cerrar sesión

### 📝 Gestión de Tareas
- `GET /api/tasks` - Listar tareas (con filtros)
- `GET /api/tasks/stats` - Estadísticas de tareas
- `GET /api/tasks/:id` - Obtener tarea específica
- `POST /api/tasks` - Crear nueva tarea
- `PATCH /api/tasks/:id` - Actualizar tarea
- `DELETE /api/tasks/:id` - Eliminar tarea

### ⚡ WebSocket Events
- `task-created` - Nueva tarea creada
- `task-updated` - Tarea actualizada
- `task-deleted` - Tarea eliminada

### 🏥 Health Checks
- `GET /api/health` - Estado del sistema
- `GET /health` - Health check básico

## 🗄️ Base de Datos

### Modelos Prisma
```prisma
model User {
  id: String @id @default(cuid())
  email: String @unique
  password: String
  name: String?
  tasks: Task[]
  completedTasks: Task[] @relation("TaskCompletedBy")
}

model Task {
  id: String @id @default(cuid())
  title: String
  description: String?
  completed: Boolean @default(false)
  priority: Priority @default(MEDIUM)
  type: TaskType @default(FEATURE)
  userId: String
  user: User @relation(fields: [userId], references: [id])
}
```

### Comandos Prisma
```bash
# Generar cliente
npx prisma generate

# Crear migración
npx prisma migrate dev --name migration_name

# Reset base de datos
npx prisma migrate reset

# Abrir Prisma Studio
npx prisma studio

# Push schema (desarrollo)
npx prisma db push
```

## 🔒 Seguridad

### Rate Limiting
- **Short**: 3 requests/segundo
- **Medium**: 20 requests/10 segundos
- **Long**: 100 requests/minuto

### Sanitización de Inputs
- Eliminación de scripts maliciosos
- Limpieza de HTML tags
- Validación con class-validator

### JWT Configuration
- **Algoritmo**: HS256
- **Expiración**: 7 días (configurable)
- **Blacklist**: Tokens invalidados en logout

## 🐳 Docker para Evaluadores

```bash
# Levantar todos los servicios (backend + BD)
docker-compose up -d

# Ver logs del backend
docker-compose logs -f backend

# Verificar que esté funcionando
curl http://localhost:3000/api/health

# Acceder al container del backend (si es necesario)
docker-compose exec backend bash
```

## 📊 Monitoring

### Health Checks para Evaluadores
- **Endpoint**: http://localhost:3000/api/health
- **Información**: Status, uptime, environment, conexión DB
- **Verificación**: Confirmar que todos los servicios están funcionando

### Logging
- **Requests**: Method, URL, status, tiempo de respuesta
- **Errors**: Stack traces estructurados  
- **Database**: Query logging en desarrollo (`DATABASE_LOGGING=true`)

## 🔧 Troubleshooting

### Problemas Comunes

#### Base de Datos
```bash
# Verificar conexión
npx prisma studio

# Reset completo
npx prisma migrate reset --force

# Verificar schema
npx prisma validate
```

#### JWT Issues
- Verificar `JWT_SECRET` (mín. 32 caracteres)
- Comprobar `JWT_EXPIRES_IN` format
- Revisar blacklist en logout

#### WebSocket
- Verificar CORS configuration
- Comprobar autenticación WebSocket
- Revisar room management

### Debug Mode
```bash
# Logs detallados
LOG_LEVEL=debug npm run start:dev

# Database queries
DATABASE_LOGGING=true npm run start:dev
```

## 📚 Documentación Adicional

- **[NestJS Documentation](https://docs.nestjs.com)** - Framework principal
- **[Prisma Documentation](https://prisma.io/docs)** - ORM y base de datos
- **[Jest Testing](https://jestjs.io/docs)** - Testing framework
- **[Socket.IO](https://socket.io/docs/v4/)** - WebSocket implementation
