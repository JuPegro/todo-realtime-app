import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '@/app.module';
import { createE2ETestingApp, cleanupE2EApp, E2ETestingContext, createUserAndGetToken, authenticatedRequest } from './helpers/testing.helper';
import { createUserFixture, createTaskFixture, createMultipleTaskFixtures, taskFixtures } from './fixtures';
import { PrismaService } from '@/common/services/prisma.service';
import { Priority } from '@prisma/client';

describe('Tasks (e2e)', () => {
  let context: E2ETestingContext;
  let app: INestApplication;
  let prisma: PrismaService;
  let userToken: string;
  let userId: string;
  let secondUserToken: string;
  let secondUserId: string;

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

    // Create test users
    const userFixture = await createUserFixture();
    const { user, token } = await createUserAndGetToken(context, userFixture);
    userToken = token;
    userId = user.id;

    const secondUserFixture = await createUserFixture({
      email: 'second@example.com',
      name: 'Second User'
    });
    const { user: secondUser, token: secondToken } = await createUserAndGetToken(context, secondUserFixture);
    secondUserToken = secondToken;
    secondUserId = secondUser.id;
  });

  describe('/tasks (GET)', () => {
    it('should return empty array when no tasks exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all tasks from all users', async () => {
      // Create tasks for both users
      const userTasks = createMultipleTaskFixtures(userId, 3);
      const secondUserTasks = createMultipleTaskFixtures(secondUserId, 2);

      for (const taskData of [...userTasks, ...secondUserTasks]) {
        await prisma.task.create({ data: taskData });
      }

      const response = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveLength(5);
      expect(response.body.some(task => task.userId === userId)).toBe(true);
      expect(response.body.some(task => task.userId === secondUserId)).toBe(true);
    });

    it('should filter tasks by status', async () => {
      const tasks = [
        createTaskFixture(userId, { status: TaskStatus.PENDING, title: 'Pending Task' }),
        createTaskFixture(userId, { status: TaskStatus.IN_PROGRESS, title: 'In Progress Task' }),
        createTaskFixture(userId, { status: TaskStatus.COMPLETED, title: 'Completed Task' }),
      ];

      for (const taskData of tasks) {
        await prisma.task.create({ data: taskData });
      }

      const response = await request(app.getHttpServer())
        .get('/tasks?status=PENDING')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].status).toBe('PENDING');
      expect(response.body[0].title).toBe('Pending Task');
    });

    it('should filter tasks by priority', async () => {
      const tasks = [
        createTaskFixture(userId, { priority: TaskPriority.HIGH, title: 'High Priority Task' }),
        createTaskFixture(userId, { priority: TaskPriority.MEDIUM, title: 'Medium Priority Task' }),
        createTaskFixture(userId, { priority: TaskPriority.LOW, title: 'Low Priority Task' }),
      ];

      for (const taskData of tasks) {
        await prisma.task.create({ data: taskData });
      }

      const response = await request(app.getHttpServer())
        .get('/tasks?priority=HIGH')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].priority).toBe('HIGH');
      expect(response.body[0].title).toBe('High Priority Task');
    });

    it('should filter tasks by multiple criteria', async () => {
      const tasks = [
        createTaskFixture(userId, { 
          status: TaskStatus.PENDING, 
          priority: TaskPriority.HIGH, 
          title: 'Pending High Priority Task' 
        }),
        createTaskFixture(userId, { 
          status: TaskStatus.PENDING, 
          priority: TaskPriority.MEDIUM, 
          title: 'Pending Medium Priority Task' 
        }),
        createTaskFixture(userId, { 
          status: TaskStatus.IN_PROGRESS, 
          priority: TaskPriority.HIGH, 
          title: 'In Progress High Priority Task' 
        }),
      ];

      for (const taskData of tasks) {
        await prisma.task.create({ data: taskData });
      }

      const response = await request(app.getHttpServer())
        .get('/tasks?status=PENDING&priority=HIGH')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].status).toBe('PENDING');
      expect(response.body[0].priority).toBe('HIGH');
      expect(response.body[0].title).toBe('Pending High Priority Task');
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/tasks')
        .expect(401);
    });
  });

  describe('/tasks (POST)', () => {
    it('should create a new task successfully', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Task description',
        priority: 'HIGH',
        status: 'PENDING',
      };

      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.title).toBe(taskData.title);
      expect(response.body.description).toBe(taskData.description);
      expect(response.body.priority).toBe(taskData.priority);
      expect(response.body.status).toBe(taskData.status);
      expect(response.body.userId).toBe(userId);
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();

      // Verify task was created in database
      const dbTask = await prisma.task.findUnique({
        where: { id: response.body.id }
      });
      expect(dbTask).toBeDefined();
      expect(dbTask.title).toBe(taskData.title);
      expect(dbTask.userId).toBe(userId);
    });

    it('should create task with minimal required fields', async () => {
      const taskData = {
        title: 'Minimal Task',
        priority: 'MEDIUM',
        status: 'PENDING',
      };

      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.title).toBe(taskData.title);
      expect(response.body.description).toBeNull();
      expect(response.body.priority).toBe(taskData.priority);
      expect(response.body.status).toBe(taskData.status);
      expect(response.body.userId).toBe(userId);
    });

    it('should fail to create task with invalid data', async () => {
      // Missing required fields
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          description: 'Task without title',
          priority: 'HIGH',
        })
        .expect(400);

      // Invalid priority
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Task with invalid priority',
          priority: 'INVALID_PRIORITY',
          status: 'PENDING',
        })
        .expect(400);

      // Invalid status
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Task with invalid status',
          priority: 'HIGH',
          status: 'INVALID_STATUS',
        })
        .expect(400);
    });

    it('should fail without authentication', async () => {
      const taskData = {
        title: 'New Task',
        priority: 'HIGH',
        status: 'PENDING',
      };

      await request(app.getHttpServer())
        .post('/tasks')
        .send(taskData)
        .expect(401);
    });
  });

  describe('/tasks/:id (PUT)', () => {
    let taskId: number;

    beforeEach(async () => {
      const taskData = createTaskFixture(userId, { title: 'Original Task' });
      const task = await prisma.task.create({ data: taskData });
      taskId = task.id;
    });

    it('should update task successfully', async () => {
      const updateData = {
        title: 'Updated Task',
        description: 'Updated description',
        priority: 'LOW',
        status: 'COMPLETED',
      };

      const response = await request(app.getHttpServer())
        .put(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body.priority).toBe(updateData.priority);
      expect(response.body.status).toBe(updateData.status);
      expect(response.body.id).toBe(taskId);
      expect(response.body.userId).toBe(userId);

      // Verify task was updated in database
      const dbTask = await prisma.task.findUnique({
        where: { id: taskId }
      });
      expect(dbTask.title).toBe(updateData.title);
      expect(dbTask.description).toBe(updateData.description);
    });

    it('should update task partially', async () => {
      const updateData = {
        status: 'IN_PROGRESS',
      };

      const response = await request(app.getHttpServer())
        .put(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe(updateData.status);
      expect(response.body.title).toBe('Original Task'); // Should remain unchanged
      expect(response.body.id).toBe(taskId);
    });

    it('should allow any authenticated user to update any task', async () => {
      const updateData = {
        title: 'Updated by Second User',
        status: 'IN_PROGRESS',
      };

      const response = await request(app.getHttpServer())
        .put(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.status).toBe(updateData.status);
      expect(response.body.userId).toBe(userId); // Original user ID should remain
    });

    it('should fail to update non-existent task', async () => {
      const updateData = {
        title: 'Updated Task',
        status: 'COMPLETED',
      };

      await request(app.getHttpServer())
        .put('/tasks/999999')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(404);
    });

    it('should fail to update with invalid data', async () => {
      await request(app.getHttpServer())
        .put(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: '',
          priority: 'INVALID_PRIORITY',
        })
        .expect(400);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .put(`/tasks/${taskId}`)
        .send({
          title: 'Updated Task',
        })
        .expect(401);
    });
  });

  describe('/tasks/:id (DELETE)', () => {
    let taskId: number;

    beforeEach(async () => {
      const taskData = createTaskFixture(userId, { title: 'Task to Delete' });
      const task = await prisma.task.create({ data: taskData });
      taskId = task.id;
    });

    it('should delete task successfully', async () => {
      await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Verify task was deleted from database
      const dbTask = await prisma.task.findUnique({
        where: { id: taskId }
      });
      expect(dbTask).toBeNull();
    });

    it('should allow any authenticated user to delete any task', async () => {
      await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect(200);

      // Verify task was deleted from database
      const dbTask = await prisma.task.findUnique({
        where: { id: taskId }
      });
      expect(dbTask).toBeNull();
    });

    it('should fail to delete non-existent task', async () => {
      await request(app.getHttpServer())
        .delete('/tasks/999999')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .expect(401);
    });
  });

  describe('Tasks CRUD Integration', () => {
    it('should perform complete CRUD operations on tasks', async () => {
      // CREATE
      const taskData = {
        title: 'Integration Test Task',
        description: 'Task for testing CRUD operations',
        priority: 'HIGH',
        status: 'PENDING',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send(taskData)
        .expect(201);

      const taskId = createResponse.body.id;
      expect(createResponse.body.title).toBe(taskData.title);

      // READ (via list)
      const listResponse = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(listResponse.body).toHaveLength(1);
      expect(listResponse.body[0].id).toBe(taskId);
      expect(listResponse.body[0].title).toBe(taskData.title);

      // UPDATE
      const updateData = {
        title: 'Updated Integration Test Task',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
      };

      const updateResponse = await request(app.getHttpServer())
        .put(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.title).toBe(updateData.title);
      expect(updateResponse.body.status).toBe(updateData.status);
      expect(updateResponse.body.priority).toBe(updateData.priority);

      // READ (verify update)
      const listAfterUpdateResponse = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(listAfterUpdateResponse.body[0].title).toBe(updateData.title);
      expect(listAfterUpdateResponse.body[0].status).toBe(updateData.status);

      // DELETE
      await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // READ (verify deletion)
      const listAfterDeleteResponse = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(listAfterDeleteResponse.body).toHaveLength(0);
    });

    it('should handle multiple users creating and managing tasks', async () => {
      // User 1 creates tasks
      const user1Tasks = [
        { title: 'User 1 Task 1', priority: 'HIGH', status: 'PENDING' },
        { title: 'User 1 Task 2', priority: 'MEDIUM', status: 'IN_PROGRESS' },
      ];

      const user1CreatedTasks = [];
      for (const taskData of user1Tasks) {
        const response = await request(app.getHttpServer())
          .post('/tasks')
          .set('Authorization', `Bearer ${userToken}`)
          .send(taskData)
          .expect(201);
        user1CreatedTasks.push(response.body);
      }

      // User 2 creates tasks
      const user2Tasks = [
        { title: 'User 2 Task 1', priority: 'LOW', status: 'PENDING' },
      ];

      const user2CreatedTasks = [];
      for (const taskData of user2Tasks) {
        const response = await request(app.getHttpServer())
          .post('/tasks')
          .set('Authorization', `Bearer ${secondUserToken}`)
          .send(taskData)
          .expect(201);
        user2CreatedTasks.push(response.body);
      }

      // Both users should see all tasks
      const allTasksResponse = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(allTasksResponse.body).toHaveLength(3);

      // User 2 updates User 1's task (should work according to specs)
      await request(app.getHttpServer())
        .put(`/tasks/${user1CreatedTasks[0].id}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({ status: 'COMPLETED' })
        .expect(200);

      // User 1 deletes User 2's task (should work according to specs)
      await request(app.getHttpServer())
        .delete(`/tasks/${user2CreatedTasks[0].id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Verify final state
      const finalTasksResponse = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(finalTasksResponse.body).toHaveLength(2);
      expect(finalTasksResponse.body.find(t => t.id === user1CreatedTasks[0].id).status).toBe('COMPLETED');
      expect(finalTasksResponse.body.find(t => t.id === user2CreatedTasks[0].id)).toBeUndefined();
    });
  });
});