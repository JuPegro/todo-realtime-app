import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy } from 'jest-mock-extended';
import { createMockPrisma } from '../mocks/prisma.mock';

export interface TestingContext {
  module: TestingModule;
  prisma: DeepMockProxy<PrismaClient>;
}

export const createTestingModule = async (
  providers: any[] = [],
  imports: any[] = []
): Promise<TestingContext> => {
  const mockPrisma = createMockPrisma();

  const moduleBuilder = Test.createTestingModule({
    imports,
    providers: [
      ...providers,
      {
        provide: 'PrismaService',
        useValue: mockPrisma,
      },
    ],
  });

  const module = await moduleBuilder.compile();

  return {
    module,
    prisma: mockPrisma,
  };
};

// Helper to clean up after tests
export const cleanupTestingModule = async (context: TestingContext) => {
  await context.module.close();
};

// Helper to create JWT payload for testing
export const createMockJwtPayload = (override = {}) => ({
  sub: 'mock-user-id',
  email: 'test@example.com',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
  ...override,
});