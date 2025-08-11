import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '@/app.module';
import { createE2ETestingApp, cleanupE2EApp, E2ETestingContext } from './helpers/testing.helper';
import { createUserFixture, userFixtures } from './fixtures';
import { PrismaService } from '@/common/services/prisma.service';

describe('Auth (e2e)', () => {
  let context: E2ETestingContext;
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    context = await createE2ETestingApp(AppModule);
    app = context.app;
    prisma = context.prisma;
  });

  afterAll(async () => {
    await cleanupE2EApp(context);
  });

  beforeEach(async () => {
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user successfully', async () => {
      const userFixture = await createUserFixture();
      
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: userFixture.email,
          password: userFixture.password,
          name: userFixture.name,
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userFixture.email);
      expect(response.body.user.name).toBe(userFixture.name);
      expect(response.body.user).not.toHaveProperty('password');

      // Verify user was created in database
      const dbUser = await prisma.user.findUnique({
        where: { email: userFixture.email }
      });
      expect(dbUser).toBeDefined();
      expect(dbUser.email).toBe(userFixture.email);
    });

    it('should fail to register with invalid email format', async () => {
      const userFixture = await createUserFixture({ email: 'invalid-email' });

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: userFixture.email,
          password: userFixture.password,
          name: userFixture.name,
        })
        .expect(400);
    });

    it('should fail to register with short password', async () => {
      const userFixture = await createUserFixture({ password: '123' });

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: userFixture.email,
          password: userFixture.password,
          name: userFixture.name,
        })
        .expect(400);
    });

    it('should fail to register with duplicate email', async () => {
      const userFixture = await createUserFixture();

      // Create first user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: userFixture.email,
          password: userFixture.password,
          name: userFixture.name,
        })
        .expect(201);

      // Try to create second user with same email
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: userFixture.email,
          password: 'differentpassword',
          name: 'Different Name',
        })
        .expect(409);
    });

    it('should fail to register without required fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          // missing password and name
        })
        .expect(400);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          password: 'password123',
          name: 'Test User',
          // missing email
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    beforeEach(async () => {
      // Create a user to login with
      const userFixture = await createUserFixture();
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: userFixture.email,
          password: userFixture.password,
          name: userFixture.name,
        });
    });

    it('should login with valid credentials', async () => {
      const userFixture = userFixtures[0];

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userFixture.email,
          password: userFixture.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userFixture.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should fail to login with invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });

    it('should fail to login with invalid password', async () => {
      const userFixture = userFixtures[0];

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userFixture.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should fail to login with missing credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          // missing password
        })
        .expect(400);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          password: 'password123',
          // missing email
        })
        .expect(400);
    });

    it('should fail to login with invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });
  });

  describe('JWT Token Validation', () => {
    let userToken: string;
    
    beforeEach(async () => {
      const userFixture = await createUserFixture();
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: userFixture.email,
          password: userFixture.password,
          name: userFixture.name,
        });
      
      userToken = response.body.access_token;
    });

    it('should access protected route with valid token', async () => {
      await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });

    it('should fail to access protected route without token', async () => {
      await request(app.getHttpServer())
        .get('/tasks')
        .expect(401);
    });

    it('should fail to access protected route with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should fail to access protected route with malformed authorization header', async () => {
      await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', userToken) // Missing 'Bearer' prefix
        .expect(401);

      await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Token ${userToken}`) // Wrong prefix
        .expect(401);
    });
  });

  describe('Auth Flow Integration', () => {
    it('should complete full auth flow: register -> login -> access protected resource', async () => {
      const userFixture = await createUserFixture();

      // Step 1: Register
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: userFixture.email,
          password: userFixture.password,
          name: userFixture.name,
        })
        .expect(201);

      const registerToken = registerResponse.body.access_token;
      expect(registerToken).toBeDefined();

      // Step 2: Login with same credentials
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userFixture.email,
          password: userFixture.password,
        })
        .expect(200);

      const loginToken = loginResponse.body.access_token;
      expect(loginToken).toBeDefined();

      // Step 3: Both tokens should work for protected routes
      await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${registerToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${loginToken}`)
        .expect(200);

      // Step 4: Create a task using the token
      const taskResponse = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${loginToken}`)
        .send({
          title: 'Test Task',
          description: 'Test task created during auth flow test',
          priority: 'MEDIUM',
          status: 'PENDING',
        })
        .expect(201);

      expect(taskResponse.body.title).toBe('Test Task');
      expect(taskResponse.body.userId).toBe(loginResponse.body.user.id);
    });
  });
});