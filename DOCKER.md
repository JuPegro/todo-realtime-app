# Docker Commands - Realtime Todo App

## 🐳 Docker Configuration

### Archivo Principal
- `docker-compose.yml` - Configuración completa con Backend, PostgreSQL y pgAdmin

## 🚀 Quick Start

### Default Environment
```bash
# Start basic services
docker-compose up -d

# View logs
docker-compose logs -f

# Apply migrations
docker-compose exec backend npx prisma migrate deploy
```

### Development Environment
```bash
# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up -d

# View development logs
docker-compose -f docker-compose.dev.yml logs -f backend
```


## 📦 Services Configuration

### PostgreSQL Database
- **Port:** 5432
- **User:** JuPegro
- **Password:** Unicotrofeo1
- **Database:** todoapp (dev: todoapp_dev, prod: configurable)
- **Container:** `realtime-todo-postgres`

### pgAdmin (Database Management)
- **URL:** http://localhost:8080
- **Email:** admin@todoapp.com
- **Password:** admin123
- **Container:** `realtime-todo-pgadmin`

### Backend API (NestJS)
- **URL:** http://localhost:3000
- **Container:** `realtime-todo-backend`
- **Health Check:** http://localhost:3000/api/health


## 🛠️ Development Commands

### Start/Stop Services
```bash
# Start only database services
docker-compose up postgres pgadmin -d

# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up -d

# Rebuild specific service
docker-compose build --no-cache backend

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v --remove-orphans
```

### Logs and Monitoring
```bash
# View logs of specific service
docker-compose logs -f backend

# Monitor resource usage
docker stats

# Check service status
docker-compose ps
```


## 💾 Database Management

### Development Database
```bash
# Run migrations
docker-compose exec backend npx prisma migrate dev

# Reset database
docker-compose exec backend npx prisma migrate reset

# Open Prisma Studio
docker-compose exec backend npx prisma studio

# Generate Prisma client
docker-compose exec backend npx prisma generate
```


### Database Access
```bash
# Access PostgreSQL container (development)
docker exec -it realtime-todo-postgres-dev psql -U JuPegro -d todoapp_dev

# Check database connection
docker exec realtime-todo-postgres pg_isready -U JuPegro -d todoapp
```

## 🔧 Maintenance Commands

### Container Management
```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Complete system cleanup
docker system prune -a --volumes
```

### Updates and Rebuilds
```bash
# Pull latest images
docker-compose pull

# Rebuild without cache
docker-compose build --no-cache

# Update and restart services
docker-compose up -d --build
```

## 📊 Debugging and Troubleshooting

### Container Debugging
```bash
# Access backend container shell
docker-compose exec backend sh

# Check container processes
docker-compose exec backend ps aux

# View container environment
docker-compose exec backend env
```

### Health Checks and Testing
```bash
# Test API endpoints
curl -f http://localhost:3000/api/health
curl -f http://localhost:3000/api/auth/test

# Check database connection from backend
docker-compose exec backend npx prisma db pull

# Test WebSocket connection
curl --include --no-buffer --header "Connection: Upgrade" --header "Upgrade: websocket" --header "Sec-WebSocket-Key: SGVsbG8sIHdvcmxkIQ==" --header "Sec-WebSocket-Version: 13" http://localhost:3000/socket.io/
```

### Common Issues
```bash
# Database connection issues
docker-compose logs postgres
docker-compose exec backend npx prisma migrate status

# Backend startup issues
docker-compose logs backend
docker-compose exec backend npm run build

# Port conflicts
docker-compose ps
netstat -tulpn | grep :3000
```

## 🌍 Environment Configuration

### Variables de Entorno para Evaluadores
```bash
# Configuración básica (ya incluida en docker-compose.yml)
POSTGRES_USER=JuPegro
POSTGRES_PASSWORD=Unicotrofeo1
POSTGRES_DB=todoapp
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
```

### Archivos de Configuración
- `backend/.env` - Variables locales de desarrollo
- `backend/.env.example` - Plantilla con todas las variables
- `docker-compose.yml` - Configuración principal para evaluación

## 🔐 Notas de Seguridad para Evaluadores

- Las credenciales por defecto están configuradas para facilitar la evaluación
- JWT secret incluido para testing (cambiar en uso real)
- CORS configurado para desarrollo local

