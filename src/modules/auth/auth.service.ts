import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { OtpChannel } from '@prisma/client';
import { OtpService } from '../otp/otp.service';
import { SessionService } from '../session/session.service';
import { StudentService } from '../student/student.service';
import { AuthResult, RequestMetadata } from './auth.types';

//orchestrates the authentication flow
//delegates to otpservice,sessionservice,and studentservice.

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly otpService: OtpService,
    private readonly sessionServices: SessionService,
    private readonly studentService: StudentService,
  ) {}

  async requestOtp(
    enrollmentNumber: string,
    channel: OtpChannel,
  ): Promise<{ message: string; expiresAt: Date }> {
    let student =
      await this.studentService.getByEnrollmentNumber(enrollmentNumber);

    if (!student) {
      this.logger.log(`Auto-registering new student: ${enrollmentNumber}`);
      student = await this.studentService.create(
        enrollmentNumber,
        `Student ${enrollmentNumber}`,
      );
    }
    //generate otp
    const otp = await this.otpService.generate(student.id, channel);

    // TODO: Actually send the OTP via the chosen channel
    // For now, log it (NEVER do this in production!)
    this.logger.warn(
      `[DEV ONLY] OTP for ${enrollmentNumber}: ${otp.code} (expires: ${otp.expiresAt.toISOString()})`,
    );

    return {
      message: `OTP sent to your ${channel.toLowerCase()}`,
      expiresAt: otp.expiresAt,
    };
  }
  async verifyOtp(
    enrollmentNumber: string,
    otpCode: string,
    metadata: RequestMetadata,
  ): Promise<{ sid: string; authResult: AuthResult }> {
    const student =
      await this.studentService.getByEnrollmentNumber(enrollmentNumber);

    if (!student) {
      throw new NotFoundException(
        `Student with enrollment number ${enrollmentNumber} not found`,
      );
    }

    //verify otp
    await this.otpService.verify(student.id, otpCode);

    //create a new session
    const session = await this.sessionServices.create(student.id, {
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
      deviceInfo: metadata.deviceInfo,
    });

    //Update last login timestamp
    this.studentService.getById(student.id).catch(() => {});

    this.logger.log(`Student ${enrollmentNumber} logged in successfully`);

    return {
      sid: session.sid,
      authResult: {
        expiresAt: session.expiresAt,
        student: {
          id: student.id,
          enrollmentNumber: student.enrollmentNumber,
          name: student.name,
          email: student.email,
          isVerified: student.isVerified,
        },
      },
    };
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionServices.revokeById(sessionId);
    this.logger.log('Session revoked (logout)');
  }
  async logoutAll(studentId: string): Promise<number> {
    return this.sessionServices.revokeAll(studentId);
  }
}
