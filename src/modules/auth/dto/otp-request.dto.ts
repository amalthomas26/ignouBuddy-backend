import {
  IsString,
  IsEnum,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';
import { OtpChannel } from '@prisma/client';
import {
  ENROLLMENT_NUMBER_MIN_LENGTH,
  ENROLLMENT_NUMBER_MAX_LENGTH,
} from '../../../common/constants/ignou.constants';

//dto for requesting an otp
export class OtpRequestDto {
  @IsString()
  @MinLength(ENROLLMENT_NUMBER_MIN_LENGTH)
  @MaxLength(ENROLLMENT_NUMBER_MAX_LENGTH)
  @Matches(/^\d{9,10}$/, {
    message: 'enrollmentNumber must be a 9 or 10 digit number',
  })
  readonly enrollmentNumber: string;

  @IsEnum(OtpChannel, {
    message: 'channel must be one of :EMAIL,SMS,WHATSAPP',
  })
  readonly channel: OtpChannel;
}
