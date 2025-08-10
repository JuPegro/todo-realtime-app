# 🐳 Docker Setup - Realtime Todo App

Este proyecto utiliza Docker para una configuración fácil del entorno de desarrollo.

## 🚀 Quick Start

1. **Levantar todos los servicios:**
   ```bash
   docker-compose up -d
   ```

2. **Ver logs en tiempo real:**
   ```bash
   docker-compose logs -f
   ```

3. **Aplicar migraciones de base de datos (si es necesario):**
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

## 📊 Servicios Incluidos

### PostgreSQL Database
- **Puerto:** 5432
- **Usuario:** JuPegro
- **Contraseña:** Unicotrofeo1
- **Base de datos:** todoapp
- **Container:** `realtime-todo-postgres`

### pgAdmin (Database Management)
- **URL:** http://localhost:8080
- **Email:** admin@todoapp.com
- **Contraseña:** admin123
- **Container:** `realtime-todo-pgadmin`

### Backend API (NestJS)
- **URL:** http://localhost:3000
- **Container:** `realtime-todo-backend`
- **Health Check:** http://localhost:3000/health

## 🛠️ Comandos Útiles

### Desarrollo
```bash
# Levantar solo la base de datos
docker-compose up postgres pgadmin -d

# Rebuild del backend
docker-compose up --build backend

# Ver logs de un servicio específico
docker-compose logs -f backend
```

### Mantenimiento
```bash
# Parar todos los servicios
docker-compose down

# Parar y eliminar volúmenes
docker-compose down -v

# Limpiar containers y volúmenes
docker-compose down -v --remove-orphans
```

### Base de Datos
```bash
# Ejecutar migraciones
docker-compose exec backend npx prisma migrate deploy

# Ver estado de la base de datos
docker-compose exec backend npx prisma studio

# Hacer backup de la base de datos
docker-compose exec postgres pg_dump -U JuPegro todoapp > backup.sql
```

## 🔧 Configuración

Las variables de entorno están configuradas en:
- `backend/.env` - Para desarrollo local
- `backend/.env.docker` - Para contenedores Docker
- `docker-compose.yml` - Variables del compose

## 🏥 Health Checks

El backend incluye health checks automáticos:
- **Intervalo:** 30 segundos
- **Timeout:** 3 segundos
- **Endpoint:** http://localhost:3000/health

## 🐞 Troubleshooting

### La base de datos no se conecta
```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps

# Ver logs de PostgreSQL
docker-compose logs postgres
```

### El backend no inicia
```bash
# Ver logs detallados
docker-compose logs backend

# Verificar migraciones
docker-compose exec backend npx prisma migrate status
```

### Puertos ocupados
Si algún puerto está ocupado, puedes cambiarlos en `docker-compose.yml`:
- PostgreSQL: `5432:5432`
- pgAdmin: `8080:80`  
- Backend: `3000:3000`