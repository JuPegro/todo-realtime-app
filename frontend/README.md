# 📱 Frontend - React Native App

Aplicación móvil construida con React Native y Expo para la gestión colaborativa de tareas en tiempo real.

## 🏗️ Arquitectura Frontend

### Estructura de Pantallas
```
screens/
├── 🔐 auth/                  # Autenticación
│   ├── LoginScreen.tsx       # Inicio de sesión
│   └── RegisterScreen.tsx    # Registro de usuario
└── 📝 app/                   # Aplicación principal
    ├── TaskListScreen.tsx    # Lista principal de tareas
    ├── AddTaskScreen.tsx     # Crear nueva tarea
    └── EditTaskScreen.tsx    # Editar tarea existente
```

### Componentes Principales
```
components/
├── 🎨 UI Components
│   ├── TaskItem.tsx          # Item individual de tarea
│   ├── TaskForm.tsx          # Formulario reutilizable
│   ├── LoadingSpinner.tsx    # Indicador de carga
│   ├── ErrorMessage.tsx      # Mensajes de error
│   └── ThemeToggle.tsx       # Cambio de tema
├── 🎭 Animated Components
│   ├── AnimatedTaskItem.tsx  # Tarea con animaciones
│   ├── AnimatedFAB.tsx       # Botón flotante animado
│   ├── PageTransition.tsx    # Transiciones de página
│   └── PullToRefreshAnimation.tsx # Pull-to-refresh
├── 🌐 Network Components
│   └── OfflineIndicator.tsx  # Indicador de estado offline
└── 🛡️ Error Handling
    └── ErrorBoundary.tsx     # Captura de errores React
```

## 🧭 Navegación y Flujo

### Stack Principal
```typescript
RootNavigator
├── AuthNavigator (No autenticado)
│   ├── LoginScreen
│   └── RegisterScreen
└── AppNavigator (Autenticado)
    ├── TaskListScreen (inicial)
    ├── AddTaskScreen (modal)
    └── EditTaskScreen (modal)
```

### Lazy Loading
- **AuthNavigator**: Login y Register screens con lazy loading
- **AppNavigator**: Add/Edit screens cargadas bajo demanda
- **Suspense fallback**: Loading spinner personalizado por tema

### Transiciones
- **Entrada**: Animación stagger para lista de tareas
- **Modal**: Presentación desde abajo para Add/Edit
- **Page**: Transiciones fluidas entre screens
- **Pull-to-refresh**: Animación customizada con Reanimated

## 🌍 Estado Global (Context)

### AuthContext
```typescript
interface AuthState {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
  error: string | null
}

// Métodos disponibles
- login(email, password)
- register(userData)
- logout()
- refreshProfile()
```

### TaskContext
```typescript
interface TaskState {
  tasks: Task[]
  loading: boolean
  error: string | null
  optimisticTasks: Task[]      // Para offline
  isOffline: boolean
  offlineActionsCount: number
  syncingOfflineActions: boolean
}

// Métodos disponibles
- fetchTasks(query?)
- createTask(data, optimistic?)
- updateTask(id, data, optimistic?)
- deleteTask(id, optimistic?)
- syncOfflineActions()
- getAllTasks()              // tasks + optimistic
```

### ThemeContext
```typescript
interface ThemeState {
  isDark: boolean
  colors: ColorScheme
}

// Métodos disponibles
- toggleTheme()
- setTheme(theme)
```

## ⚡ Características en Tiempo Real

### WebSocket Integration
- **Conexión automática** al autenticarse
- **Reconexión** automática si se pierde conexión
- **Events soportados**:
  - `task-created`: Nueva tarea → Agregar a lista
  - `task-updated`: Tarea modificada → Actualizar en lista  
  - `task-deleted`: Tarea eliminada → Remover de lista

### Optimistic Updates
- **Create**: Mostrar tarea inmediatamente, confirmar con servidor
- **Update**: Aplicar cambio localmente, revertir si falla
- **Delete**: Ocultar inmediatamente, restaurar si falla
- **Visual feedback**: Indicador de "sincronizando"

## 🔄 Soporte Offline

### Funcionalidades Offline
- **Cache local**: Últimas tareas en AsyncStorage (5 min TTL)
- **Cola de acciones**: Operaciones pendientes en AsyncStorage
- **Sincronización automática**: Al recuperar conexión
- **Indicador visual**: Estado de conexión y acciones pendientes

### Estrategia de Datos
1. **Fetch**: Intentar servidor → Fallback a cache
2. **Create**: Cola offline → Optimistic UI → Sync cuando online
3. **Update**: Cola offline → Optimistic UI → Sync cuando online
4. **Delete**: Cola offline → Optimistic UI → Sync cuando online

## 🎨 Theming y Estilos

### Tema Dinámico
- **Light theme**: Colores claros, alta legibilidad
- **Dark theme**: Colores oscuros, reducción de fatiga visual
- **Persistencia**: Preferencia guardada en AsyncStorage
- **Animación**: Transición suave entre temas

### Colores Principales
```typescript
// Light Theme
primary: '#159DD9'
background: '#FFFFFF'
surface: '#F8FAFC'
onPrimary: '#FFFFFF'

// Dark Theme  
primary: '#4FC3F7'
background: '#121212'
surface: '#1E1E1E'
onPrimary: '#000000'
```

## 🔧 Configuración de Desarrollo

### Auto-detección de API
```typescript
// La app detecta automáticamente la IP del servidor
const getApiUrl = () => {
  const localhost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost'
  const port = process.env.EXPO_PUBLIC_API_PORT || '3000'
  return `http://${localhost}:${port}/api`
}
```

### Variables de Entorno
```env
# Opcional - Puerto específico
EXPO_PUBLIC_API_PORT=3000

# Opcional - Host específico (normalmente auto-detectado)
EXPO_PUBLIC_API_HOST=192.168.1.100
```

### Debugging
```bash
# React Native Debugger
npx react-native start --reset-cache

# Flipper (desarrollo avanzado)
npx expo install react-native-flipper

# Console logs
npx expo start --clear
```

## 📱 Responsividad y UX

### Diseño Adaptativo
- **Componentes responsivos**: Adaptan a diferentes tamaños
- **Touch targets**: Mínimo 44px para accesibilidad
- **Safe areas**: Respeto por notches y barras del sistema
- **Keyboard avoidance**: Scroll automático en formularios

### Accesibilidad
- **Screen readers**: Labels descriptivos
- **Color contrast**: WCAG AA compliance
- **Focus management**: Navegación por teclado
- **Reduced motion**: Respeta preferencias del sistema

### Performance
- **Lazy loading**: Screens cargadas bajo demanda
- **Memoization**: Componentes optimizados con React.memo
- **Virtualization**: Para listas largas (implementación futura)
- **Image optimization**: Carga diferida de imágenes

## 🧪 Testing Frontend

### Estrategia de Testing
- **Component testing**: Jest + React Native Testing Library
- **Navigation testing**: Pruebas de flujo entre screens  
- **Context testing**: Estados globales y efectos secundarios
- **E2E testing**: Detox para testing end-to-end

### Testing Utilities
```typescript
// Custom render con providers
const renderWithProviders = (component) => {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <TaskProvider>
          {component}
        </TaskProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
```

## 🚀 Ejecución para Evaluadores

### Comandos Básicos
```bash
# Iniciar aplicación
npx expo start

# Limpiar cache si hay problemas
npx expo start --clear

# Ejecutar en navegador web (opcional)
npm run web
```

## 🔍 Troubleshooting Frontend

### Problemas Comunes

#### Error de Conexión
```bash
# 1. Verificar que backend esté corriendo
curl http://localhost:3000/api/health

# 2. Limpiar cache de Expo
npx expo start --clear

# 3. Verificar IP en logs de Expo
# La IP debe coincidir con la del backend
```

#### Problemas de Navegación
- **Verificar**: React Navigation instalado correctamente
- **Check**: Linking configuration en app.json
- **Debug**: Navigation state con React Navigation DevTools

#### Performance Issues
- **Profile**: Con React DevTools Profiler
- **Memory leaks**: Verificar listeners y subscriptions
- **Bundle size**: Analizar con `npx expo export --dump-assetmap`

### Tips de Debugging
- **Remote debugging**: Chrome DevTools
- **Network debugging**: Reactotron
- **State debugging**: Redux DevTools (si se implementa)
- **Layout debugging**: Inspector de Expo/React Native