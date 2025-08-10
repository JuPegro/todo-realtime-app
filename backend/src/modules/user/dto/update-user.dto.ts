import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsOptional()
  password?: string;

  @IsString({ message: 'El nombre debe ser un texto' })
  @IsOptional()
  name?: string;
}