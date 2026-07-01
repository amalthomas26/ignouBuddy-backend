import { Injectable } from '@nestjs/common';
import {
  Programme,
  Course,
  RegionalCentre,
  StudentEnrollment,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AcademicRepository {
  constructor(private readonly prisma: PrismaService) {}

  //programmes

  async findAllProgrammes(): Promise<Programme[]> {
    return this.prisma.programme.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });
  }

  async findProgrammeByCode(code: string): Promise<Programme | null> {
    return this.prisma.programme.findUnique({
      where: { code },
    });
  }

  async findProgrammeById(id: string): Promise<Programme | null> {
    return this.prisma.programme.findUnique({ where: { id } });
  }

  //courses

  async findCoursesByProgramme(
    programmeId: string,
    semester?: number,
  ): Promise<Course[]> {
    return this.prisma.course.findMany({
      where: {
        programmeId,
        isActive: true,
        ...(semester !== undefined ? { semester } : {}),
      },
      orderBy: [{ semester: 'asc' }, { code: 'asc' }],
    });
  }

  async findCourseByCode(code: string): Promise<Course | null> {
    return this.prisma.course.findUnique({ where: { code } });
  }

  async findCourseById(id: string): Promise<Course | null> {
    return this.prisma.course.findUnique({ where: { id } });
  }

  //Regional centre

  async findAllRegionalCentres(): Promise<RegionalCentre[]> {
    return this.prisma.regionalCentre.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findRegionalyCentreByCode(
    code: string,
  ): Promise<RegionalCentre | null> {
    return this.prisma.regionalCentre.findUnique({
      where: { code },
    });
  }

  //student enrollment

  async findCurrentEnrollment(studentId: string): Promise<
    | (StudentEnrollment & {
        programme: Programme;
        regionalCentre: RegionalCentre;
      })
    | null
  > {
    return this.prisma.studentEnrollment.findFirst({
      where: {
        studentId,
        isCurrentEnrollment: true,
      },
      include: {
        programme: true,
        regionalCentre: true,
      },
    });
  }

  async findEnrollmentByStudent(
    studentId: string,
  ): Promise<StudentEnrollment[]> {
    return this.prisma.studentEnrollment.findMany({
      where: { studentId },
      include: {
        programme: true,
        regionalCentre: true,
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }
}
