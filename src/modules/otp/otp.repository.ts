import { Injectable } from '@nestjs/common';
import { Otp, OtpChannel } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class OtpRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    studentId: string;
    code: string;
    channel: OtpChannel;
    expiresAt: Date;
    maxAttempts: number;
  }): Promise<Otp> {
    return this.prisma.otp.create({ data });
  }

  async findLatestValid(studentId: string): Promise<Otp | null> {
    return this.prisma.otp.findFirst({
      where: {
        studentId,
        isVerified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countRecentByStudent(
    studentId: string,
    windowStart: Date,
  ): Promise<number> {
    return this.prisma.otp.count({
      where: {
        studentId,
        createdAt: { gte: windowStart },
      },
    });
  }

  async incrementAttempts(id: string): Promise<Otp> {
    return this.prisma.otp.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
  }

  async markVerified(id: string): Promise<Otp> {
    return this.prisma.otp.update({
      where: { id },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    });
  }

  async invalidateAllForStudent(studentId: string): Promise<void> {
    await this.prisma.otp.updateMany({
      where: {
        studentId,
        isVerified: false,
      },
      data: {
        expiresAt: new Date(), //expire them immediately
      },
    });
  }

  //delete otp that expired more than 24 hours ago
  async deleteExpired(): Promise<number> {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);

    const result = await this.prisma.otp.deleteMany({
      where: {
        expiresAt: { lt: cutoff },
      },
    });
    return result.count;
  }
}
