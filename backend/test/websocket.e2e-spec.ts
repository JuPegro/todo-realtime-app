import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import request = require('supertest');
import { AppModule } from '@/app.module';
import { createE2ETestingApp, cleanupE2EApp, E2ETestingContext, createUserAndGetToken } from './helpers/testing.helper';
import { createUserFixture, createTaskFixture } from './fixtures';
import { PrismaService } from '@/common/services/prisma.service';
import { TaskStatus, TaskPriority } from './fixtures/task.fixtures';

describe('WebSocket (e2e)', () => {
  let context: E2ETestingContext;
  let app: INestApplication;
  let prisma: PrismaService;
  let userToken: string;
  let userId: number;
  let secondUserToken: string;
  let secondUserId: number;

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

  describe('WebSocket Connection', () => {
    let clientSocket: Socket;

    afterEach(() => {
      if (clientSocket) {
        clientSocket.disconnect();
      }
    });

    it('should connect to WebSocket with valid JWT token', (done) => {
      const port = app.getHttpServer().address()?.port || 3000;
      clientSocket = io(`http://localhost:${port}`, {
        auth: {
          token: userToken,
        },
        transports: ['websocket']
      });

      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        done();
      });

      clientSocket.on('connect_error', (error) => {
        done(error);
      });
    });

    it('should reject WebSocket connection with invalid JWT token', (done) => {
      const port = app.getHttpServer().address()?.port || 3000;
      clientSocket = io(`http://localhost:${port}`, {
        auth: {
          token: 'invalid-token',
        },
        transports: ['websocket']
      });

      clientSocket.on('connect', () => {
        done(new Error('Should not connect with invalid token'));
      });

      clientSocket.on('connect_error', (error) => {
        expect(error).toBeDefined();
        done();
      });
    });

    it('should reject WebSocket connection without JWT token', (done) => {
      const port = app.getHttpServer().address()?.port || 3000;
      clientSocket = io(`http://localhost:${port}`, {
        transports: ['websocket']
      });

      clientSocket.on('connect', () => {
        done(new Error('Should not connect without token'));
      });

      clientSocket.on('connect_error', (error) => {
        expect(error).toBeDefined();
        done();
      });
    });
  });

  describe('Task Real-time Events', () => {
    let userSocket: Socket;
    let secondUserSocket: Socket;

    beforeEach((done) => {
      const port = app.getHttpServer().address()?.port || 3000;
      
      userSocket = io(`http://localhost:${port}`, {
        auth: { token: userToken },
        transports: ['websocket']
      });

      secondUserSocket = io(`http://localhost:${port}`, {
        auth: { token: secondUserToken },
        transports: ['websocket']
      });

      let connectionsReady = 0;
      const onConnect = () => {
        connectionsReady++;
        if (connectionsReady === 2) {
          done();
        }
      };

      userSocket.on('connect', onConnect);
      secondUserSocket.on('connect', onConnect);
    });

    afterEach(() => {
      if (userSocket) {
        userSocket.disconnect();
      }
      if (secondUserSocket) {
        secondUserSocket.disconnect();
      }
    });

    it('should broadcast taskCreated event when task is created', (done) => {
      const taskData = {
        title: 'WebSocket Test Task',
        description: 'Task created for WebSocket testing',
        priority: 'HIGH',
        status: 'PENDING',
      };

      let receivedEvents = 0;
      const checkDone = () => {
        receivedEvents++;
        if (receivedEvents === 2) {
          done();
        }
      };

      // Both users should receive the event
      userSocket.on('taskCreated', (data) => {
        expect(data.title).toBe(taskData.title);
        expect(data.description).toBe(taskData.description);
        expect(data.priority).toBe(taskData.priority);
        expect(data.status).toBe(taskData.status);
        expect(data.userId).toBe(userId);
        expect(data.id).toBeDefined();
        checkDone();
      });

      secondUserSocket.on('taskCreated', (data) => {
        expect(data.title).toBe(taskData.title);
        expect(data.userId).toBe(userId);
        checkDone();
      });

      // Create task via HTTP API
      setTimeout(() => {
        request(app.getHttpServer())
          .post('/tasks')
          .set('Authorization', `Bearer ${userToken}`)
          .send(taskData)
          .expect(201)
          .end(() => {
            // Request completed, now wait for WebSocket events
          });
      }, 100);
    });

    it('should broadcast taskUpdated event when task is updated', async () => {
      // First create a task
      const taskData = createTaskFixture(userId, { title: 'Task to Update' });
      const createdTask = await prisma.task.create({ data: taskData });

      const updateData = {
        title: 'Updated WebSocket Task',
        status: 'IN_PROGRESS',
      };

      return new Promise<void>((resolve, reject) => {
        let receivedEvents = 0;
        const checkDone = () => {
          receivedEvents++;
          if (receivedEvents === 2) {
            resolve();
          }
        };

        const timeout = setTimeout(() => {
          reject(new Error('Timeout waiting for WebSocket events'));
        }, 5000);

        // Both users should receive the event
        userSocket.on('taskUpdated', (data) => {
          expect(data.id).toBe(createdTask.id);
          expect(data.title).toBe(updateData.title);
          expect(data.status).toBe(updateData.status);
          expect(data.userId).toBe(userId);
          clearTimeout(timeout);
          checkDone();
        });

        secondUserSocket.on('taskUpdated', (data) => {
          expect(data.id).toBe(createdTask.id);
          expect(data.title).toBe(updateData.title);
          clearTimeout(timeout);
          checkDone();
        });

        // Update task via HTTP API
        setTimeout(() => {
          request(app.getHttpServer())
            .put(`/tasks/${createdTask.id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(updateData)
            .expect(200)
            .end(() => {
              // Request completed, now wait for WebSocket events
            });
        }, 100);
      });
    });

    it('should broadcast taskDeleted event when task is deleted', async () => {
      // First create a task
      const taskData = createTaskFixture(userId, { title: 'Task to Delete' });
      const createdTask = await prisma.task.create({ data: taskData });

      return new Promise<void>((resolve, reject) => {
        let receivedEvents = 0;
        const checkDone = () => {
          receivedEvents++;
          if (receivedEvents === 2) {
            resolve();
          }
        };

        const timeout = setTimeout(() => {
          reject(new Error('Timeout waiting for WebSocket events'));
        }, 5000);

        // Both users should receive the event
        userSocket.on('taskDeleted', (data) => {
          expect(data.id).toBe(createdTask.id);
          expect(data.userId).toBe(userId);
          clearTimeout(timeout);
          checkDone();
        });

        secondUserSocket.on('taskDeleted', (data) => {
          expect(data.id).toBe(createdTask.id);
          clearTimeout(timeout);
          checkDone();
        });

        // Delete task via HTTP API
        setTimeout(() => {
          request(app.getHttpServer())
            .delete(`/tasks/${createdTask.id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200)
            .end(() => {
              // Request completed, now wait for WebSocket events
            });
        }, 100);
      });
    });

    it('should handle multiple rapid task operations', async () => {
      const operations = [
        { type: 'create', data: { title: 'Task 1', priority: 'HIGH', status: 'PENDING' } },
        { type: 'create', data: { title: 'Task 2', priority: 'MEDIUM', status: 'PENDING' } },
        { type: 'create', data: { title: 'Task 3', priority: 'LOW', status: 'PENDING' } },
      ];

      return new Promise<void>((resolve, reject) => {
        let receivedEvents = 0;
        const expectedEvents = operations.length * 2; // Each operation should trigger 2 events (one per connected client)

        const timeout = setTimeout(() => {
          reject(new Error(`Timeout: received ${receivedEvents}/${expectedEvents} events`));
        }, 10000);

        const checkDone = () => {
          receivedEvents++;
          if (receivedEvents === expectedEvents) {
            clearTimeout(timeout);
            resolve();
          }
        };

        userSocket.on('taskCreated', checkDone);
        secondUserSocket.on('taskCreated', checkDone);

        // Perform all operations rapidly
        let delay = 0;
        operations.forEach((operation) => {
          setTimeout(() => {
            if (operation.type === 'create') {
              request(app.getHttpServer())
                .post('/tasks')
                .set('Authorization', `Bearer ${userToken}`)
                .send(operation.data)
                .expect(201)
                .end(() => {
                  // Request completed
                });
            }
          }, delay);
          delay += 100;
        });
      });
    });
  });

  describe('WebSocket Error Handling', () => {
    let clientSocket: Socket;

    afterEach(() => {
      if (clientSocket) {
        clientSocket.disconnect();
      }
    });

    it('should handle connection drops gracefully', (done) => {
      const port = app.getHttpServer().address()?.port || 3000;
      clientSocket = io(`http://localhost:${port}`, {
        auth: { token: userToken },
        transports: ['websocket']
      });

      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        
        // Force disconnect
        clientSocket.disconnect();
      });

      clientSocket.on('disconnect', (reason) => {
        expect(reason).toBeDefined();
        done();
      });
    });

    it('should handle reconnection after temporary disconnection', (done) => {
      const port = app.getHttpServer().address()?.port || 3000;
      clientSocket = io(`http://localhost:${port}`, {
        auth: { token: userToken },
        transports: ['websocket']
      });

      let connectCount = 0;

      clientSocket.on('connect', () => {
        connectCount++;
        
        if (connectCount === 1) {
          // First connection, disconnect and reconnect
          clientSocket.disconnect();
          setTimeout(() => {
            clientSocket.connect();
          }, 100);
        } else if (connectCount === 2) {
          // Second connection (reconnection)
          expect(clientSocket.connected).toBe(true);
          done();
        }
      });
    });
  });

  describe('Cross-User Real-time Updates', () => {
    let user1Socket: Socket;
    let user2Socket: Socket;

    beforeEach((done) => {
      const port = app.getHttpServer().address()?.port || 3000;
      
      user1Socket = io(`http://localhost:${port}`, {
        auth: { token: userToken },
        transports: ['websocket']
      });

      user2Socket = io(`http://localhost:${port}`, {
        auth: { token: secondUserToken },
        transports: ['websocket']
      });

      let connectionsReady = 0;
      const onConnect = () => {
        connectionsReady++;
        if (connectionsReady === 2) {
          done();
        }
      };

      user1Socket.on('connect', onConnect);
      user2Socket.on('connect', onConnect);
    });

    afterEach(() => {
      if (user1Socket) {
        user1Socket.disconnect();
      }
      if (user2Socket) {
        user2Socket.disconnect();
      }
    });

    it('should notify all users when any user creates a task', (done) => {
      const taskData = {
        title: 'Cross-user notification test',
        priority: 'MEDIUM',
        status: 'PENDING',
      };

      // User 2 should receive notification when User 1 creates a task
      user2Socket.on('taskCreated', (data) => {
        expect(data.title).toBe(taskData.title);
        expect(data.userId).toBe(userId); // Created by user 1
        done();
      });

      // User 1 creates the task
      setTimeout(() => {
        request(app.getHttpServer())
          .post('/tasks')
          .set('Authorization', `Bearer ${userToken}`)
          .send(taskData)
          .expect(201)
          .end(() => {
            // Task created
          });
      }, 100);
    });

    it('should notify all users when any user updates any task', async () => {
      // User 1 creates a task
      const taskData = createTaskFixture(userId, { title: 'Task to be updated by user 2' });
      const createdTask = await prisma.task.create({ data: taskData });

      const updateData = {
        title: 'Updated by User 2',
        status: 'COMPLETED',
      };

      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout waiting for cross-user update notification'));
        }, 5000);

        // User 1 should receive notification when User 2 updates the task
        user1Socket.on('taskUpdated', (data) => {
          expect(data.id).toBe(createdTask.id);
          expect(data.title).toBe(updateData.title);
          expect(data.status).toBe(updateData.status);
          expect(data.userId).toBe(userId); // Original creator remains
          clearTimeout(timeout);
          resolve();
        });

        // User 2 updates User 1's task
        setTimeout(() => {
          request(app.getHttpServer())
            .put(`/tasks/${createdTask.id}`)
            .set('Authorization', `Bearer ${secondUserToken}`)
            .send(updateData)
            .expect(200)
            .end(() => {
              // Task updated
            });
        }, 100);
      });
    });

    it('should notify all users when any user deletes any task', async () => {
      // User 2 creates a task
      const taskData = createTaskFixture(secondUserId, { title: 'Task to be deleted by user 1' });
      const createdTask = await prisma.task.create({ data: taskData });

      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout waiting for cross-user delete notification'));
        }, 5000);

        // User 2 should receive notification when User 1 deletes their task
        user2Socket.on('taskDeleted', (data) => {
          expect(data.id).toBe(createdTask.id);
          expect(data.userId).toBe(secondUserId);
          clearTimeout(timeout);
          resolve();
        });

        // User 1 deletes User 2's task
        setTimeout(() => {
          request(app.getHttpServer())
            .delete(`/tasks/${createdTask.id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200)
            .end(() => {
              // Task deleted
            });
        }, 100);
      });
    });
  });
});