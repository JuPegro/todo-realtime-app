import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { TasksGateway } from './tasks.gateway';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../../common/services/prisma.service';
import { OwnershipValidationService } from '../../common/services/ownership-validation.service';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [TasksController],
  providers: [TasksService, TasksRepository, TasksGateway, PrismaService, OwnershipValidationService],
  exports: [TasksService, TasksRepository],
})
export class TasksModule {}