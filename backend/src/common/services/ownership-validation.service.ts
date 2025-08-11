import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TaskForbiddenException, TaskNotFoundException } from '../exceptions';

@Injectable()
export class OwnershipValidationService {
  constructor(private readonly prisma: PrismaService) {}

  async validateTaskOwnership(taskId: string, userId: string): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!task) {
      throw new TaskNotFoundException(taskId);
    }

    if (task.userId !== userId) {
      throw new TaskForbiddenException('No tienes permiso para acceder a esta tarea');
    }
  }

  async validateUserOwnership(resourceId: string, userId: string, resourceType: 'user'): Promise<void> {
    if (resourceType === 'user') {
      const user = await this.prisma.user.findUnique({
        where: { id: resourceId },
        select: { id: true },
      });

      if (!user) {
        throw new TaskNotFoundException(`Usuario con ID "${resourceId}" no encontrado`);
      }

      if (resourceId !== userId) {
        throw new TaskForbiddenException('No tienes permiso para acceder a este recurso');
      }
    }
  }

  async taskExists(taskId: string): Promise<boolean> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true },
    });

    return !!task;
  }

  async userExists(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    return !!user;
  }
}