import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const authToken = this.extractTokenFromHeader(client);

      if (!authToken) {
        throw new WsException('Token no encontrado');
      }

      const payload = this.jwtService.verify(authToken);
      client.data.user = payload;
      return true;
    } catch (error) {
      throw new WsException('Token inválido o expirado');
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    // Intentar obtener el token del header Authorization
    const authorization = client.handshake.headers.authorization;
    if (authorization && authorization.startsWith('Bearer ')) {
      return authorization.substring(7);
    }

    // Intentar obtener el token del query string
    const token = client.handshake.query.token;
    if (typeof token === 'string') {
      return token;
    }

    // Intentar obtener el token de los headers personalizados
    const authHeader = client.handshake.auth?.token;
    if (authHeader) {
      return authHeader;
    }

    return undefined;
  }
}