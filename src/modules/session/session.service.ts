import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Session } from '@prisma/client';
import { randomBytes } from 'crypto';
import { SessionRepository } from './session.repository';
import { SESSION_DEFAULT_EXPIRY_HOURS } from '../../common/constants/ignou.constants';

//on login a cryptographically random `sid` is generated
// and stored in the DB.
// The `sid` is set as an HttpOnly cookie on the client.
// On each request, the AuthGuard reads the cookie, looks up the session,
// and extends the expiry (sliding window).
// On logout, the session is revoked and the cookie is cleared.

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly sessionExpiryHours: number;

  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly configService: ConfigService,
  ) {
    this.sessionExpiryHours = SESSION_DEFAULT_EXPIRY_HOURS;
  }

  async create(
    studentId: string,
    metadata: {
      userAgent?: string;
      ipAddress?: string;
      deviceInfo?: string;
    },
  ): Promise<Session> {
    // Generate a cryptographically secure session ID
    const sid = this.generateSid();

    //calculate expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.sessionExpiryHours);

    const session = await this.sessionRepository.create({
      studentId,
      sid,
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
      deviceInfo: metadata.deviceInfo,
      expiresAt,
    });

    this.logger.log(`Session created for student ${studentId}`);

    return session;
  }

  async revokeById(sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) throw new UnauthorizedException('Invalid session');

    await this.sessionRepository.revoke(session.id);
    this.logger.log(`Session ${session.id} revoked`);
  }

  async revokeBySid(sid: string): Promise<void> {
    const session = await this.sessionRepository.findBySid(sid);
    if (!session) throw new UnauthorizedException('Invalid session');

    await this.sessionRepository.revoke(session.id);
    this.logger.log(`Session ${session.id} revoked`);
  }

  async revokeAll(studentId: string): Promise<number> {
    const count = await this.sessionRepository.revokeAllForStudent(studentId);
    this.logger.log(`${count} sessions revoked for student ${studentId}`);
    return count;
  }

  async getActiveSessions(studentId: string): Promise<Session[]> {
    return this.sessionRepository.findActiveByStudent(studentId);
  }

  private generateSid(): string {
    return randomBytes(48).toString('hex');
  }
}
