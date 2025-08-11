import { IsString, IsOptional, IsEnum, IsDateString, IsBoolean, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { Priority, TaskType } from '@prisma/client';

export class UpdateTaskDto {
  @IsOptional()
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El título no puede exceder 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  title?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'El estado de completado debe ser verdadero o falso' })
  completed?: boolean;

  @IsOptional()
  @IsEnum(Priority, { message: 'La prioridad debe ser LOW, MEDIUM, HIGH o URGENT' })
  priority?: Priority;

  @IsOptional()
  @IsEnum(TaskType, { message: 'El tipo de tarea no es válido' })
  type?: TaskType;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe tener un formato válido (ISO)' })
  taskDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La hora de inicio debe tener un formato válido (ISO)' })
  startTime?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La hora de fin debe tener un formato válido (ISO)' })
  endTime?: string;
}