import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, originalUrl, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length') || 0;
      const duration = Date.now() - startTime;

      const logMessage = `${method} ${originalUrl} ${statusCode} ${contentLength}b - ${duration}ms - ${ip} "${userAgent}"`;

      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}