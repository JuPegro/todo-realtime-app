import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async getHealth() {
    const startTime = Date.now();
    
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;
      
      const uptime = process.uptime();
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(uptime)} seconds`,
        environment: this.configService.get('app.environment'),
        version: process.env.npm_package_version || '1.0.0',
        database: {
          status: 'connected',
          responseTime: `${responseTime}ms`,
        },
        memory: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
          total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        database: {
          status: 'disconnected',
          error: error.message,
        },
      };
    }
  }

  async getReadiness() {
    try {
      // Test critical dependencies
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'pass',
        },
      };
    } catch (error) {
      return {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'fail',
        },
        error: error.message,
      };
    }
  }

  getLiveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(process.uptime())} seconds`,
    };
  }
}