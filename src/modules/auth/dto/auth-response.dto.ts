import { Expose, Type } from 'class-transformer';

export class AuthResponseDto {
  @Expose()
  @Type(() => AuthStudentDto)
  student: AuthStudentDto;
}

// Student info included in auth response
export class AuthStudentDto {
  @Expose()
  id: string;

  @Expose()
  enrollmentNumber: string;

  @Expose()
  name: string;

  @Expose()
  email: string | null;

  @Expose()
  isVerified: boolean;
}
