import { Module } from '@nestjs/common';
import { AcademicService } from './academic.service';
import { AcademicRepository } from './academic.repository';

@Module({
  providers: [AcademicService, AcademicRepository],
  exports: [AcademicService],
})
export class AcademicModule {}
