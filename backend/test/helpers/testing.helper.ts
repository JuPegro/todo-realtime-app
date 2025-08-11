import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaClient, User, Task } from '@prisma/client';
import { DeepMockProxy } from 'jest-mock-extended';
import { JwtService } from '@nestjs/jwt';
import request = require('supertest');
import { createMockPrisma } from '../mocks/prisma.mock';
import { PrismaService } from '@/common/services/prisma.service';

export interface TestingContext {
  module: TestingModule;
  prisma: DeepMockProxy<PrismaClient>;
}

export interface E2ETestingContext {
  app: INestApplication;
  prisma: PrismaService;
  jwtService: JwtService;
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

export const createE2ETestingApp = async (module: any): Promise<E2ETestingContext> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [module],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  const prisma = app.get<PrismaService>(PrismaService);
  const jwtService = app.get<JwtService>(JwtService);

  return {
    app,
    prisma,
    jwtService,
  };
};

// Helper to clean up after tests
export const cleanupTestingModule = async (context: TestingContext) => {
  await context.module.close();
};

export const cleanupE2EApp = async (context: E2ETestingContext) => {
  await context.app.close();
};

// Helper to create JWT payload for testing
export const createMockJwtPayload = (override = {}) => ({
  sub: 'mock-user-id',
  email: 'test@example.com',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
  ...override,
});

// Helper to create user and get JWT token for E2E testing
export const createUserAndGetToken = async (
  context: E2ETestingContext,
  userData: { email: string; password: string; name: string }
): Promise<{ user: User; token: string }> => {
  const registerResponse = await request(context.app.getHttpServer())
    .post('/auth/register')
    .send(userData)
    .expect(201);

  const user = registerResponse.body.user;
  const token = registerResponse.body.access_token;

  return { user, token };
};

// Helper to create authenticated request
export const authenticatedRequest = (
  app: INestApplication,
  token: string
) => {
  return (method: 'get' | 'post' | 'put' | 'delete', path: string) => {
    return request(app.getHttpServer())
      [method](path)
      .set('Authorization', `Bearer ${token}`);
  };
};

// Helper to seed database with test data
export const seedDatabase = async (
  prisma: PrismaService,
  users: any[] = [],
  tasks: any[] = []
): Promise<{ users: User[]; tasks: Task[] }> => {
  const createdUsers: User[] = [];
  const createdTasks: Task[] = [];

  for (const userData of users) {
    const user = await prisma.user.create({ data: userData });
    createdUsers.push(user);
  }

  for (const taskData of tasks) {
    const task = await prisma.task.create({ data: taskData });
    createdTasks.push(task);
  }

  return { users: createdUsers, tasks: createdTasks };
};