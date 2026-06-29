import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionRepository } from './session.repository';

@Module({
  providers: [SessionService, SessionRepository],
  exports: [SessionService], //auth module needs this
})
export class SessionModule {}
