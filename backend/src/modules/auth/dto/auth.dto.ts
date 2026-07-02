import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

// Shared password policy (mirrors @nati/shared registerSchema — the frontend
// enforces the same rules via Zod).
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72;

function Password(): PropertyDecorator {
  return function (target: object, propertyKey: string | symbol): void {
    IsString()(target, propertyKey);
    MinLength(PASSWORD_MIN)(target, propertyKey);
    MaxLength(PASSWORD_MAX)(target, propertyKey);
    Matches(/[A-Z]/, { message: 'password must contain an uppercase letter' })(target, propertyKey);
    Matches(/[a-z]/, { message: 'password must contain a lowercase letter' })(target, propertyKey);
    Matches(/[0-9]/, { message: 'password must contain a number' })(target, propertyKey);
  };
}

const lower = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  );

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: 'jane@example.com' })
  @lower()
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: PASSWORD_MIN, example: 'Secret123' })
  @Password()
  password!: string;
}

export class LoginDto {
  @ApiProperty({ example: 'jane@example.com' })
  @lower()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class VerifyEmailDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @lower()
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ minLength: PASSWORD_MIN })
  @Password()
  password!: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty({ minLength: PASSWORD_MIN })
  @Password()
  newPassword!: string;
}
