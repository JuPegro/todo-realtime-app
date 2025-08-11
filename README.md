# Realtime Todo App

Una aplicación de tareas colaborativa en tiempo real construida con **NestJS** (backend) y **React Native** (frontend).

## Características

- **Autenticación JWT** completa (registro, login, logout)
- **API REST** robusta con validaciones
- **Base de datos PostgreSQL** con Prisma ORM
- **Docker** para desarrollo y producción
- **Testing** unitario y e2e configurado
- **Navegación protegida** en React Native
- **Estados de carga** y manejo de errores

## Stack Tecnológico

### Backend (NestJS)
- **NestJS** - Framework Node.js
- **PostgreSQL** - Base de datos
- **Prisma** - ORM
- **JWT** - Autenticación
- **Jest** - Testing
- **Docker** - Containerización

### Frontend (React Native)
- **React Native** - Framework móvil
- **Expo** - Desarrollo y build
- **React Navigation** - Navegación
- **AsyncStorage** - Persistencia local
- **Axios** - Cliente HTTP

## Instalación Rápida

### Opción 1: Con Docker (Recomendado)

```bash
# Clonar el repositorio
git clone <repository-url>
cd realtime-todo-app

# Levantar todos los servicios
docker-compose up -d

# Ver logs del backend
docker-compose logs -f backend

# La API estará disponible en: http://localhost:3000/api
```

### Opción 2: Desarrollo Local

**Backend:**
```bash
cd backend
npm install
docker-compose up -d postgres  # Solo la BD
npx prisma migrate dev
npm run start:dev
```

**Frontend:**
```bash
cd frontend
npm install

# Configuración automática de IP y puerto ✅
# No necesitas cambiar nada manualmente!
# Expo detecta automáticamente tu IP local

npx expo start
```

## URLs de Acceso

- **API Backend**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health
- **PostgreSQL**: localhost:5432
- **pgAdmin**: http://localhost:8080
  - Email: admin@todoapp.com
  - Password: admin123

## Testing

```bash
# Backend - Tests unitarios
cd backend
npm run test

# Backend - Tests e2e
npm run test:e2e

# Backend - Coverage
npm run test:cov
```

## Estructura del Proyecto

```
/
├── backend/          # API NestJS
│   ├── src/
│   ├── prisma/
│   ├── test/
│   └── Dockerfile
├── frontend/         # App React Native
│   ├── src/
│   └── package.json
└── docker-compose.yml
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Perfil de usuario (requiere JWT)
- `POST /api/auth/logout` - Cerrar sesión

### Utilidades
- `GET /api/health` - Health check

## Desarrollo

### Variables de Entorno

El archivo `.env` del backend debe contener:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/todoapp
JWT_SECRET=your-super-secret-jwt-key-32-chars-minimum
PORT=3000
NODE_ENV=development
```

### Comandos Útiles

```bash
# Detener todos los containers
docker-compose down

# Reconstruir y levantar
docker-compose up --build

# Ver logs
docker-compose logs -f [service-name]

# Ejecutar migraciones en Docker
docker-compose exec backend npx prisma migrate dev
```

## Próximas Funcionalidades

- Módulo de Tareas (CRUD completo)
- WebSocket para tiempo real
- Notificaciones push
- Tema claro/oscuro
- Offline support

## Soporte

Si encuentras algún problema:

1. **Backend (Docker)**:
   - Verifica que Docker esté corriendo
   - Revisa los logs: `docker-compose logs -f`
   - Asegúrate que los puertos no estén ocupados
   - Reinicia los containers: `docker-compose restart`

2. **Frontend (React Native)**:
   - **Configuración automática** ✅: La app detecta tu IP automáticamente
   - **Puerto personalizado**: Crea `.env` con `EXPO_PUBLIC_API_PORT=TU_PUERTO`
   - **Error "Network Error"**: Verifica que el backend esté corriendo en Docker
   - **Ver URL detectada**: Revisa los logs de Expo para confirmar la URL generada

---

**Desarrollado como prueba técnica - Ready for production deployment**