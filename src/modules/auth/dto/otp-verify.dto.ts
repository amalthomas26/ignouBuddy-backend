import {
  IsString,
  Matches,
  MinLength,
  MaxLength,
  Length,
} from 'class-validator';
import {
  ENROLLMENT_NUMBER_MIN_LENGTH,
  ENROLLMENT_NUMBER_MAX_LENGTH,
  OTP_CODE_LENGTH,
} from '../../../common/constants/ignou.constants';

export class OtpVerifyDto {
  @IsString()
  @MinLength(ENROLLMENT_NUMBER_MIN_LENGTH)
  @MaxLength(ENROLLMENT_NUMBER_MAX_LENGTH)
  @Matches(/^\d{9,10}$/, {
    message: 'enrollmentNumber must be a 9 or 10 digit number',
  })
  readonly enrollmentNumber: string;

  @IsString()
  @Length(OTP_CODE_LENGTH, OTP_CODE_LENGTH, {
    message: `otpCode must be exactly ${OTP_CODE_LENGTH} digits`,
  })
  @Matches(/^\d+$/, { message: 'otpCode must contain only digits' })
  readonly otpCode: string;
}

