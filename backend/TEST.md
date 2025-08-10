# 🧪 Testing Setup - Backend

Este proyecto usa Jest para pruebas unitarias e integración con mocks de Prisma.

## 🚀 Comandos de Testing

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm run test:cov

# Ejecutar tests E2E
npm run test:e2e

# Debug de tests
npm run test:debug
```

## 🗄️ Base de Datos de Testing

### Setup automático
```bash
# Levantar base de datos de testing
docker-compose up postgres-test -d

# Aplicar migraciones a la BD de testing
npm run test:db:setup

# Resetear BD de testing
npm run test:db:reset
```

### Configuración
- **Puerto:** 5433 (diferente al dev en 5432)
- **BD:** todoapp_test
- **Variables:** archivo `.env.test`

## 🎭 Mocks y Helpers

### Prisma Mocks
```typescript
import { createMockUser, createMockTask } from '../test/mocks/prisma.mock';
import { prismaMock } from '../test/setup';

// En tus tests
prismaMock.user.findUnique.mockResolvedValue(createMockUser());
```

### Testing Helpers
```typescript
import { createTestingModule } from '../test/helpers/testing.helper';

const { module, prisma } = await createTestingModule([YourService]);
```

## 📊 Coverage

- **Objetivo mínimo:** 80% en todas las métricas
- **Configurado en:** `package.json` jest.coverageThreshold
- **Reportes:** generados en `/coverage`

## 🏗️ Estructura de Tests

```
test/
├── setup.ts              # Configuración global de tests
├── mocks/
│   └── prisma.mock.ts     # Mocks de Prisma
└── helpers/
    └── testing.helper.ts  # Helpers para crear módulos de test

src/
├── **/*.spec.ts          # Tests unitarios
└── **/*.e2e-spec.ts      # Tests E2E
```

## ✅ Ejemplo de Test

```typescript
import { Test } from '@nestjs/testing';
import { createTestingModule } from '../test/helpers/testing.helper';
import { createMockUser } from '../test/mocks/prisma.mock';

describe('UserService', () => {
  let context: TestingContext;
  
  beforeEach(async () => {
    context = await createTestingModule([UserService]);
  });
  
  afterEach(async () => {
    await cleanupTestingModule(context);
  });
  
  it('should find user by email', async () => {
    const mockUser = createMockUser({ email: 'test@example.com' });
    context.prisma.user.findUnique.mockResolvedValue(mockUser);
    
    const service = context.module.get(UserService);
    const result = await service.findByEmail('test@example.com');
    
    expect(result).toEqual(mockUser);
  });
});
```

## 🐞 Troubleshooting

### Tests lentos
- Los mocks de Prisma pueden ser lentos en la primera ejecución
- Usar `--detectOpenHandles` para encontrar memory leaks

### BD de testing no funciona
```bash
# Verificar que el contenedor esté corriendo
docker-compose ps

# Ver logs del contenedor de testing
docker-compose logs postgres-test
```