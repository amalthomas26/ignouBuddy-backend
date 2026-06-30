import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpModule } from '../otp/otp.module';
import { SessionModule } from '../session/session.module';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [OtpModule, SessionModule, StudentModule],
  controllers: [AuthController],
  providers: [AuthService], //within the auth module
  exports: [AuthService], ///outside the auth module
})
export class AuthModule {}
