import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { GlobalValidationPipe } from './common/pipes/validation.pipe';
import { SanitizationPipe } from './common/pipes/sanitization.pipe';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Socket.IO Adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  // Global Filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Pipes
  app.useGlobalPipes(
    new SanitizationPipe(),
    new GlobalValidationPipe(),
  );

  // CORS Configuration
  const corsOrigin = configService.get('cors.origin');
  const isDevelopment = configService.get('app.isDevelopment');
  
  app.enableCors({
    origin: isDevelopment 
      ? ['http://localhost:19006', 'http://localhost:8081', 'http://192.168.68.104:19006', corsOrigin] 
      : corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Global Prefix
  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });

  const port = configService.get('port') || 3000;
  const environment = configService.get('app.environment');

  await app.listen(port, '0.0.0.0');

  logger.log(`Application is running on: http://localhost:${port}/api`);
  logger.log(`Also accessible at: http://192.168.68.104:${port}/api`);
  logger.log(`Environment: ${environment}`);
  logger.log(`Global prefix: /api`);
}
bootstrap();
