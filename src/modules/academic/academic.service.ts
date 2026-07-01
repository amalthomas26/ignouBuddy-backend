import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import {
  Programme,
  Course,
  RegionalCentre,
  StudentEnrollment,
} from '@prisma/client';
import { AcademicRepository } from './academic.repository';

@Injectable()
export class AcademicService {
  private readonly logger = new Logger(AcademicService.name);

  constructor(private readonly academicRepository: AcademicRepository) {}

  //programmes

  async getAllProgrammes(): Promise<Programme[]> {
    return this.academicRepository.findAllProgrammes();
  }

  async getProgrammeByCode(code: string): Promise<Programme> {
    const programme = await this.academicRepository.findProgrammeByCode(code);
    if (!programme) {
      throw new NotFoundException(`Programme ${code} not found`);
    }
    return programme;
  }

  //courses

  async getCourseByProgramme(
    programmeCode: string,
    semester?: number,
  ): Promise<Course[]> {
    const programme = await this.getProgrammeByCode(programmeCode);
    return this.academicRepository.findCoursesByProgramme(
      programme.id,
      semester,
    );
  }

  async getCourseByCode(code: string): Promise<Course> {
    const course = await this.academicRepository.findCourseByCode(code);

    if (!course) throw new NotFoundException(`Course ${code} not found`);

    return course;
  }

  //regional centres

  async getAllRegionCentres(): Promise<RegionalCentre[]> {
    return this.academicRepository.findAllRegionalCentres();
  }

  //student enrollment

  async getCurrentEnrollment(studentId: string): Promise<
    StudentEnrollment & {
      programme: Programme;
      regionalCentre: RegionalCentre;
    }
  > {
    const enrollment =
      await this.academicRepository.findCurrentEnrollment(studentId);

    if (!enrollment) {
      throw new NotFoundException(
        'no active enrollments found for this student',
      );
    }

    return enrollment;
  }

  //enrollment history for a student

  async getEnrollmentHistory(studentId: string): Promise<StudentEnrollment[]> {
    return this.academicRepository.findEnrollmentByStudent(studentId);
  }
}
