import { IsString, IsNotEmpty, IsPort, IsIn, IsOptional, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN?: string = '7d';

  @Transform(({ value }) => parseInt(value, 10))
  @IsPort()
  @IsOptional()
  PORT?: number = 3000;

  @IsString()
  @IsIn(['development', 'production', 'test'])
  @IsOptional()
  NODE_ENV?: string = 'development';

  @IsString()
  @IsOptional()
  POSTGRES_HOST?: string = 'localhost';

  @Transform(({ value }) => parseInt(value, 10))
  @IsPort()
  @IsOptional()
  POSTGRES_PORT?: number = 5432;

  @IsString()
  @IsOptional()
  POSTGRES_DB?: string;

  @IsString()
  @IsOptional()
  POSTGRES_USER?: string;

  @IsString()
  @IsOptional()
  POSTGRES_PASSWORD?: string;

  // CORS Configuration
  @IsString()
  @IsOptional()
  CORS_ORIGIN?: string = '*';

  // Rate Limiting
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  RATE_LIMIT_TTL?: number = 60;

  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  RATE_LIMIT_REQUESTS?: number = 100;
}

export function validate(config: Record<string, unknown>) {
  const { validateSync } = require('class-validator');
  const { plainToClass } = require('class-transformer');
  
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.toString()}`);
  }

  return validatedConfig;
}