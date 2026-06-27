import {
  IsOptional,
  IsString,
  IsEmail,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'phone must be a valid international phone number',
  })
  readonly phone?: string;
}
