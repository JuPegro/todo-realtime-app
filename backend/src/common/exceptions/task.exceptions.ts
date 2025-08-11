import { HttpException, HttpStatus } from '@nestjs/common';

export class TaskNotFoundException extends HttpException {
  constructor(taskId?: string) {
    const message = taskId 
      ? `Tarea con ID "${taskId}" no encontrada`
      : 'Tarea no encontrada';
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class TaskForbiddenException extends HttpException {
  constructor(message: string = 'No tienes permiso para acceder a esta tarea') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class TaskValidationException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class TaskInvalidDateException extends TaskValidationException {
  constructor(message: string = 'Las fechas proporcionadas no son válidas') {
    super(message);
  }
}