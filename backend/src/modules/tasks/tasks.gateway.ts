import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { WsJwtAuthGuard } from '../auth/guards/ws-jwt-auth.guard';

@WebSocketGateway({
  cors: {
    origin: ["http://localhost:8081", "exp://192.168.1.1:8081", "*"],
    methods: ["GET", "POST"],
    credentials: true
  }
})
export class TasksGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly tasksService: TasksService) {}

  handleConnection(client: Socket) {
    // Client connected
  }

  handleDisconnect(client: Socket) {
    // Client disconnected
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('create-task')
  async handleCreateTask(
    @MessageBody() createTaskDto: CreateTaskDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = client.data.user.sub;
      const task = await this.tasksService.create(createTaskDto, userId);
      
      // Emitir a todos los clientes que se creó una nueva tarea
      this.server.emit('task-created', task);
      
      return { success: true, data: task };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('update-task')
  async handleUpdateTask(
    @MessageBody() data: { id: string; updateTaskDto: UpdateTaskDto },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = client.data.user.sub;
      const task = await this.tasksService.update(data.id, data.updateTaskDto, userId);
      
      // Emitir a todos los clientes que se actualizó una tarea
      this.server.emit('task-updated', task);
      
      return { success: true, data: task };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('delete-task')
  async handleDeleteTask(
    @MessageBody() data: { id: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = client.data.user.sub;
      const task = await this.tasksService.remove(data.id, userId);
      
      // Emitir a todos los clientes que se eliminó una tarea
      this.server.emit('task-deleted', { id: data.id, task });
      
      return { success: true, data: task };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Método para emitir eventos desde el controlador
  emitTaskCreated(task: any) {
    this.server.emit('task-created', task);
  }

  emitTaskUpdated(task: any) {
    this.server.emit('task-updated', task);
  }

  emitTaskDeleted(taskId: string, task: any) {
    this.server.emit('task-deleted', { id: taskId, task });
  }
}