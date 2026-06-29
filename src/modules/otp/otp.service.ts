import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Otp, OtpChannel } from '@prisma/client';
import { randomInt } from 'crypto';
import { OtpRepository } from './otp.repository';
import { OTP_CODE_LENGTH } from '../../common/constants/ignou.constants';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly expiryMinutes: number;
  private readonly maxAttempts: number;
  private readonly rateLimitWindowMinutes: number;
  private readonly rateLimitMaxCount: number;

  constructor(
    private readonly otpRepository: OtpRepository,
    private readonly configService: ConfigService,
  ) {
    this.expiryMinutes = this.configService.get<number>(
      'OTP_EXPIRY_MINUTES',
      5,
    );

    this.maxAttempts = this.configService.get<number>('OTP_MAX_ATTEMPTS', 3);

    this.rateLimitWindowMinutes = this.configService.get<number>(
      'OTP_RATE_LIMIT_WINDOW_MINUTES',
      15,
    );
    this.rateLimitMaxCount = this.configService.get<number>(
      'OTP_RATE_LIMIT_MAX_COUNT',
      5,
    );
  }

  async generate(studentId: string, channel: OtpChannel): Promise<Otp> {
    //rate limit check
    await this.checkRateLimit(studentId);

    //invalidate any existing otps
    await this.otpRepository.invalidateAllForStudent(studentId);

    //generate a cryptographically secure 6-digit code
    const code = this.generateCode();

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.expiryMinutes);

    const otp = await this.otpRepository.create({
      studentId,
      code,
      channel,
      expiresAt,
      maxAttempts: this.maxAttempts,
    });

    this.logger.log(
      `OTP generated for student
     ${studentId} via ${channel}, expires at ${expiresAt.toISOString()}`,
    );

    return otp;
  }

  async verify(studentId: string, submittedCode: string): Promise<Otp> {
    const otp = await this.otpRepository.findLatestValid(studentId);

    if (!otp) {
      throw new BadRequestException(
        'No active OTP found.Please request a new one.',
      );
    }
    if (otp.attempts >= otp.maxAttempts) {
      throw new BadRequestException(
        'Maximum OTP attempts exceeded. Please request a new OTP.',
      );
    }
    await this.otpRepository.incrementAttempts(otp.id);

    if (otp.code !== submittedCode) {
      const remaining = otp.maxAttempts - otp.attempts - 1;
      throw new BadRequestException(
        `Invalid OTP code. ${remaining} attempt(s) remaining.`,
      );
    }

    const verifiedOtp = await this.otpRepository.markVerified(otp.id);

    //invalidate all other otps for this student
    await this.otpRepository.invalidateAllForStudent(studentId);

    this.logger.log(`OTP verified for student ${studentId}`);

    return verifiedOtp;
  }

  private async checkRateLimit(studentId: string): Promise<void> {
    const windowStart = new Date();
    windowStart.setMinutes(
      windowStart.getMinutes() - this.rateLimitWindowMinutes,
    );

    const count = await this.otpRepository.countRecentByStudent(
      studentId,
      windowStart,
    );
    if (count >= this.rateLimitMaxCount) {
      throw new HttpException(
        `Too many OTP requests. Please wait
         ${this.rateLimitWindowMinutes} minutes before trying again.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private generateCode(): string {
    const min = Math.pow(10, OTP_CODE_LENGTH - 1);
    const max = Math.pow(10, OTP_CODE_LENGTH) - 1;
    return randomInt(min, max + 1).toString();
  }
}
