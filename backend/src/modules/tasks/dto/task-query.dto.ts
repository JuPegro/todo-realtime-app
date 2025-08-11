import { IsOptional, IsEnum, IsString, IsBoolean, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Priority, TaskType } from '@prisma/client';

export class TaskQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La página debe ser un número' })
  @Min(1, { message: 'La página debe ser mayor a 0' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El límite debe ser un número' })
  @Min(1, { message: 'El límite debe ser mayor a 0' })
  @Max(100, { message: 'El límite no puede ser mayor a 100' })
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: 'El término de búsqueda debe ser texto' })
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @IsEnum(Priority, { message: 'La prioridad debe ser LOW, MEDIUM, HIGH o URGENT' })
  priority?: Priority;

  @IsOptional()
  @IsEnum(TaskType, { message: 'El tipo de tarea no es válido' })
  type?: TaskType;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'El estado de completado debe ser true o false' })
  completed?: boolean;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha desde debe tener formato válido (ISO)' })
  dateFrom?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha hasta debe tener formato válido (ISO)' })
  dateTo?: string;

  @IsOptional()
  @IsString({ message: 'El orden debe ser texto' })
  @Transform(({ value }) => value?.toLowerCase())
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: 'La dirección debe ser asc o desc' })
  sortOrder?: 'asc' | 'desc' = 'desc';
}