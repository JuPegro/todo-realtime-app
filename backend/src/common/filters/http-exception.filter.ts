import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | object;
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      
      if (typeof errorResponse === 'string') {
        message = errorResponse;
        error = exception.name;
      } else {
        message = (errorResponse as any).message || errorResponse;
        error = (errorResponse as any).error || exception.name;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Database Error';

      switch (exception.code) {
        case 'P2002':
          // Unique constraint violation
          const target = exception.meta?.target as string[] || [];
          if (target.includes('email')) {
            message = 'El email ya está registrado';
          } else {
            message = 'Un registro con estos datos ya existe';
          }
          status = HttpStatus.CONFLICT;
          break;
        case 'P2025':
          // Record not found
          message = 'Registro no encontrado o ya ha sido eliminado';
          status = HttpStatus.NOT_FOUND;
          break;
        case 'P2003':
          // Foreign key constraint violation
          message = 'Referencia inválida - el registro relacionado no existe';
          status = HttpStatus.BAD_REQUEST;
          break;
        case 'P2014':
          // Required relation violation
          message = 'Error de relación - datos requeridos faltantes';
          status = HttpStatus.BAD_REQUEST;
          break;
        case 'P2023':
          // Inconsistent column data
          message = 'Datos inconsistentes en la base de datos';
          status = HttpStatus.BAD_REQUEST;
          break;
        case 'P2001':
          // Record does not exist
          message = 'El registro que intentas acceder no existe';
          status = HttpStatus.NOT_FOUND;
          break;
        default:
          message = `Error de base de datos (${exception.code})`;
          this.logger.error(`Unhandled Prisma error: ${exception.code}`, exception.message);
          break;
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Validation Error';
      message = 'Datos inválidos o formato incorrecto';
    } else if (exception instanceof Prisma.PrismaClientInitializationError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      error = 'Database Connection Error';
      message = 'Error de conexión con la base de datos';
      this.logger.error('Prisma initialization error', exception.message);
    } else if (exception instanceof Prisma.PrismaClientRustPanicError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      error = 'Database Critical Error';
      message = 'Error crítico en la base de datos';
      this.logger.error('Prisma rust panic error', exception.message);
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      error = 'Internal Server Error';
      message = 'Error interno del servidor';
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error,
      message,
      ...(process.env.NODE_ENV === 'development' && exception instanceof Error && {
        stack: exception.stack,
      }),
    };

    // Structured logging for monitoring
    const logContext = {
      method: request.method,
      url: request.url,
      statusCode: status,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      userId: (request as any).user?.sub,
      timestamp: new Date().toISOString(),
      ...(exception instanceof Error && { 
        errorName: exception.name,
        errorMessage: exception.message,
      }),
    };

    if (status >= 500) {
      this.logger.error(
        `Server Error: ${request.method} ${request.url} - ${status}`,
        {
          ...logContext,
          stack: exception instanceof Error ? exception.stack : undefined,
          exception: exception instanceof Error ? exception : String(exception),
        },
      );
    } else if (status >= 400) {
      this.logger.warn(
        `Client Error: ${request.method} ${request.url} - ${status}`,
        logContext,
      );
    } else {
      this.logger.log(
        `Request: ${request.method} ${request.url} - ${status}`,
        logContext,
      );
    }

    response.status(status).json(errorResponse);
  }
}