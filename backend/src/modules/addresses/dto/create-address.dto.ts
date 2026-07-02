import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty()
  @IsString()
  @Length(1, 50)
  label!: string;

  @ApiProperty()
  @IsString()
  @Length(1, 100)
  recipientName!: string;

  @ApiProperty()
  @IsString()
  @Length(1, 200)
  line1!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 200)
  line2?: string;

  @ApiProperty()
  @IsString()
  @Length(1, 100)
  city!: string;

  @ApiProperty()
  @IsString()
  @Length(1, 100)
  state!: string;

  @ApiProperty()
  @IsString()
  @Length(1, 20)
  postalCode!: string;

  @ApiProperty()
  @IsString()
  @Length(2, 100)
  country!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(5, 20)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto extends PartialType(CreateAddressDto) {}
