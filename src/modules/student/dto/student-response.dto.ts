import { Expose } from 'class-transformer';

//only fields with @Expose() are included in response

export class StudentResponseDto {
  @Expose()
  id: string;

  @Expose()
  enrollmentNumber: string;

  @Expose()
  name: string;

  @Expose()
  email: string | null;

  @Expose()
  phone: string | null;

  @Expose()
  whatsappNumber: string | null;

  @Expose()
  isVerified: boolean;

  @Expose()
  lastLoginAt: Date | null;

  @Expose()
  createdAt: Date;
}
