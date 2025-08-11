import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockRequest: jest.Mocked<Request>;
  let mockResponse: jest.Mocked<Response>;
  let mockArgumentsHost: jest.Mocked<ArgumentsHost>;

  beforeEach(async () => {
    mockRequest = {
      url: '/test',
      method: 'GET',
      headers: {
        'user-agent': 'test-agent',
      },
      ip: '127.0.0.1',
    } as any;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpExceptionFilter],
    }).compile();

    filter = module.get<HttpExceptionFilter>(HttpExceptionFilter);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should handle HttpException with string message', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      
      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'HttpException',
          message: 'Test error',
          method: 'GET',
          path: '/test',
        }),
      );
    });

    it('should handle HttpException with object response', () => {
      const errorResponse = {
        message: 'Validation failed',
        error: 'Bad Request',
      };
      const exception = new HttpException(errorResponse, HttpStatus.BAD_REQUEST);
      
      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: 'Validation failed',
        }),
      );
    });

    it('should handle Prisma unique constraint violation (P2002)', () => {
      const exception = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '4.0.0',
          meta: { target: ['email'] },
        },
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.CONFLICT,
          error: 'Database Error',
          message: 'El email ya está registrado',
        }),
      );
    });

    it('should handle Prisma unique constraint violation (P2002) without email', () => {
      const exception = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '4.0.0',
          meta: { target: ['username'] },
        },
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Un registro con estos datos ya existe',
        }),
      );
    });

    it('should handle Prisma record not found (P2025)', () => {
      const exception = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        {
          code: 'P2025',
          clientVersion: '4.0.0',
        },
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Registro no encontrado o ya ha sido eliminado',
        }),
      );
    });

    it('should handle Prisma foreign key constraint (P2003)', () => {
      const exception = new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint',
        {
          code: 'P2003',
          clientVersion: '4.0.0',
        },
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Referencia inválida - el registro relacionado no existe',
        }),
      );
    });

    it('should handle Prisma validation error', () => {
      const exception = new Prisma.PrismaClientValidationError(
        'Validation error',
        '4.0.0',
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation Error',
          message: 'Datos inválidos o formato incorrecto',
        }),
      );
    });

    it('should handle Prisma initialization error', () => {
      const exception = new Prisma.PrismaClientInitializationError(
        'Initialization error',
        '4.0.0',
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Database Connection Error',
          message: 'Error de conexión con la base de datos',
        }),
      );
    });

    it('should handle unknown errors', () => {
      const exception = new Error('Unknown error');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
          message: 'Error interno del servidor',
        }),
      );
    });

    it('should include stack trace in development', () => {
      process.env.NODE_ENV = 'development';
      const exception = new Error('Test error');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.any(String),
        }),
      );

      delete process.env.NODE_ENV;
    });

    it('should not include stack trace in production', () => {
      process.env.NODE_ENV = 'production';
      const exception = new Error('Test error');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.not.objectContaining({
          stack: expect.any(String),
        }),
      );

      delete process.env.NODE_ENV;
    });

    it('should include userId in log context when available', () => {
      (mockRequest as any).user = { sub: 'user123' };
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      
      const loggerWarnSpy = jest.spyOn((filter as any).logger, 'warn');

      filter.catch(exception, mockArgumentsHost);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Client Error'),
        expect.objectContaining({
          userId: 'user123',
        }),
      );
    });
  });
});