import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { GlobalValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global Filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Pipes
  app.useGlobalPipes(new GlobalValidationPipe());

  // CORS Configuration
  app.enableCors({
    origin: configService.get('cors.origin'),
    credentials: true,
  });

  // Global Prefix
  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });

  const port = configService.get('port') || 3000;
  const environment = configService.get('app.environment');

  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}/api`);
  logger.log(`Environment: ${environment}`);
  logger.log(`Global prefix: /api`);
}
bootstrap();
