import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentRepository } from './student.repository';

@Module({
  providers: [StudentService, StudentRepository],
  exports: [StudentService], //Auth module needs this
})
export class StudentModule {}
