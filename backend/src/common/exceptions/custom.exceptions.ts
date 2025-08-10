import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor(identifier?: string) {
    super(
      `Usuario ${identifier ? `con ${identifier}` : ''} no encontrado`,
      HttpStatus.NOT_FOUND,
    );
  }
}

export class TaskNotFoundException extends HttpException {
  constructor(taskId?: string) {
    super(
      `Tarea ${taskId ? `con ID ${taskId}` : ''} no encontrada`,
      HttpStatus.NOT_FOUND,
    );
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = 'No autorizado') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = 'Acceso denegado') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class TaskOwnershipException extends ForbiddenException {
  constructor() {
    super('No tienes permisos para acceder a esta tarea');
  }
}

export class InvalidCredentialsException extends HttpException {
  constructor() {
    super('Credenciales inválidas', HttpStatus.UNAUTHORIZED);
  }
}

export class EmailAlreadyExistsException extends HttpException {
  constructor(email: string) {
    super(
      `El email ${email} ya está registrado`,
      HttpStatus.CONFLICT,
    );
  }
}

export class ValidationException extends HttpException {
  constructor(message: string | object) {
    super(
      {
        error: 'Validation Error',
        message: message,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}