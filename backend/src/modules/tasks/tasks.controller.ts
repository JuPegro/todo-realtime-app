import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksGateway } from './tasks.gateway';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly tasksGateway: TasksGateway,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    const userId = req.user?.id || req.user?.sub;
    const task = await this.tasksService.create(createTaskDto, userId);
    
    // Emitir evento WebSocket
    this.tasksGateway.emitTaskCreated(task);
    
    return task;
  }

  @Get()
  async findAll(@Query() query: TaskQueryDto, @Request() req) {
    const userId = req.user?.id || req.user?.sub;
    return await this.tasksService.findAll(query, userId);
  }

  @Get('stats')
  async getStats(@Request() req) {
    const userId = req.user?.id || req.user?.sub;
    return await this.tasksService.getTaskStats(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id || req.user?.sub;
    return await this.tasksService.findOne(id, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req
  ) {
    const userId = req.user?.id || req.user?.sub;
    const task = await this.tasksService.update(id, updateTaskDto, userId);
    
    // Emitir evento WebSocket
    this.tasksGateway.emitTaskUpdated(task);
    
    return task;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id || req.user?.sub;
    const task = await this.tasksService.remove(id, userId);
    
    // Emitir evento WebSocket
    this.tasksGateway.emitTaskDeleted(id, task);
    
    return task;
  }
}