import { Injectable } from '@nestjs/common';
import { Session } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  //create a new session
  async create(data: {
    studentId: string;
    sid: string;
    userAgent?: string;
    ipAddress?: string;
    deviceInfo?: string;
    expiresAt: Date;
  }): Promise<Session> {
    return this.prisma.session.create({ data });
  }

  //find a session by sid
  async findBySid(sid: string): Promise<Session | null> {
    return this.prisma.session.findUnique({
      where: { sid },
    });
  }

  //find a session by internal uuid
  async findById(id: string): Promise<Session | null> {
    return this.prisma.session.findUnique({
      where: { id },
    });
  }

  async revoke(id: string): Promise<Session> {
    return this.prisma.session.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForStudent(studentId: string): Promise<number> {
    const result = await this.prisma.session.updateMany({
      where: {
        studentId,
        revokedAt: null, //onll revoke active sessions
      },
      data: { revokedAt: new Date() },
    });
    return result.count;
  }

  //get all active session for a student
  async findActiveByStudent(studentId: string): Promise<Session[]> {
    return this.prisma.session.findMany({
      where: {
        studentId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActivityAt: 'desc' },
    });
  }

  //delete sessions that have been expired for more than 7 days
  async deleteExpired(): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);

    const result = await this.prisma.session.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: cutoff } },
          { revokedAt: { lt: cutoff } },
          //expired or revoked 7+ days ago
        ],
      },
    });
    return result.count;
  }
}
