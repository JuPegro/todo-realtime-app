import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class SanitizationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }

    if (value && typeof value === 'object') {
      return this.sanitizeObject(value);
    }

    return value;
  }

  private sanitizeString(str: string): string {
    // Remove script tags and their content
    str = str.replace(/<script[^>]*>.*?<\/script>/gi, '');
    
    // Remove HTML tags but keep the content
    str = str.replace(/<[^>]*>/g, '');
    
    // Remove potential XSS patterns
    str = str.replace(/javascript:/gi, '');
    str = str.replace(/on\w+\s*=/gi, '');
    str = str.replace(/vbscript:/gi, '');
    
    // Remove excessive whitespace
    str = str.trim().replace(/\s+/g, ' ');
    
    return str;
  }

  private sanitizeObject(obj: any): any {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (value && typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}