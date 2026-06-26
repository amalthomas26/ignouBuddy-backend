import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyRequest } from 'fastify';
import { PrismaService } from '../../database/prisma.service';
import {
  SESSION_COOKIE_NAME,
  SESSION_DEFAULT_EXPIRY_HOURS,
} from '../constants/ignou.constants';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const sid = this.extractSidFromCookie(request);

    if (!sid) {
      throw new UnauthorizedException('Missing session cookie');
    }

    const session = await this.prisma.session.findUnique({
      where: { sid },
      include: {
        student: {
          select: {
            id: true,
            enrollmentNumber: true,
            name: true,
            email: true,
            isActive: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!session) throw new UnauthorizedException('Invalid session');

    if (session.revokedAt)
      throw new UnauthorizedException('Session has expired');

    if (session.expiresAt < new Date())
      throw new UnauthorizedException('Session has expired');

    if (!session.student.isActive || session.student.deletedAt)
      throw new UnauthorizedException('Account is deactivated');

    // Attach student to request so controllers can access it
    (request as FastifyRequest & { student: unknown }).student =
      session.student;

    // Attach session ID so logout can find it
    (request as FastifyRequest & { sessionId: string }).sessionId = session.id;

    const newExpiresAt = new Date();
    newExpiresAt.setHours(
      newExpiresAt.getHours() + SESSION_DEFAULT_EXPIRY_HOURS,
    );

    this.prisma.session
      .update({
        where: { id: session.id },
        data: {
          lastActivityAt: new Date(),
          expiresAt: newExpiresAt,
        },
      })
      .catch((err: Error) => {
        this.logger.warn(`Failed to extend session:${err.message}`);
      });

    return true;
  }
  private extractSidFromCookie(request: FastifyRequest): string | null {
    const cookies = (
      request as FastifyRequest & { cookies?: Record<string, string> }
    ).cookies;
    if (!cookies) return null;

    return cookies[SESSION_COOKIE_NAME] ?? null;
  }
}
