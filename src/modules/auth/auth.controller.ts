import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { OtpRequestDto } from './dto/otp-request.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentStudent } from '../../common/decorators/current-student.decorator';
import type { StudentFromToken } from '../../common/decorators/current-student.decorator';
import {
  SESSION_COOKIE_NAME,
  SESSION_DEFAULT_EXPIRY_HOURS,
} from '../../common/constants/ignou.constants';

//auth controller here handles login,otp,and session endpoints

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  async requestOtp(@Body() dto: OtpRequestDto) {
    return this.authService.requestOtp(dto.enrollmentNumber, dto.channel);
  }

  @Post('/otp/verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body() dto: OtpVerifyDto,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const { sid, authResult } = await this.authService.verifyOtp(
      dto.enrollmentNumber,
      dto.otpCode,
      {
        userAgent: request.headers['user-agent'],
        ipAddress: request.ip,
      },
    );

    reply.setCookie(SESSION_COOKIE_NAME, sid, {
      httpOnly: true, // js cannot read this cookie
      secure: process.env.NODE_ENV === 'production', //HTTPS only in production
      sameSite: 'lax', //csrf protection
      path: '/',
      maxAge: SESSION_DEFAULT_EXPIRY_HOURS * 60 * 60,
    });
    return { student: authResult.student };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const sessionId = (
      request as FastifyRequest & {
        sessionId: string;
      }
    ).sessionId;

    await this.authService.logout(sessionId);

    reply.clearCookie(SESSION_COOKIE_NAME, { path: '/' });

    return { message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @CurrentStudent() student: StudentFromToken, //because needs all sessions of the student
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const count = await this.authService.logoutAll(student.id);

    reply.clearCookie(SESSION_COOKIE_NAME, { path: '/' });

    return { message: `${count} session(s) revoked` };
  }
}
