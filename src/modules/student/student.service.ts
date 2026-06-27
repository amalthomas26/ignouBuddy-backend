import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Student } from '@prisma/client';
import { StudentRepository } from './student.repository';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);

  constructor(private readonly studentRepository: StudentRepository) {}

  async getById(id: string): Promise<Student> {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async getByEnrollmentNumber(
    enrollmentNumber: string,
  ): Promise<Student | null> {
    return this.studentRepository.findByEnrollmentNumber(enrollmentNumber);
  }

  async create(enrollmentNumber: string, name: string): Promise<Student> {
    const exists =
      await this.studentRepository.existsByEnrollmentNumber(enrollmentNumber);
    if (exists)
      throw new ConflictException(
        `Student with enrollment number ${enrollmentNumber} already exists`,
      );
    this.logger.log(`Creating new student: ${enrollmentNumber}`);

    return this.studentRepository.createWithPreferences({
      enrollmentNumber,
      name,
    });
  }

  async update(id: string, dto: UpdateStudentDto): Promise<Student> {
    await this.getById(id);
    return this.studentRepository.update(id, dto);
  }

  async deactivate(id: string): Promise<void> {
    await this.getById(id);
    await this.studentRepository.softDelete(id);
    this.logger.log(`Student ${id} deactivated`);
  }
}
