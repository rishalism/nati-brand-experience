import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class AddToCartDto {
  @ApiProperty()
  @IsUUID()
  productId!: string;

  @ApiProperty({ minimum: 1, default: 1 })
  @IsInt()
  @Min(1)
  quantity: number = 1;
}

export class UpdateCartItemDto {
  @ApiProperty({ minimum: 0, description: '0 removes the line' })
  @IsInt()
  @Min(0)
  quantity!: number;
}

export class MergeCartDto {
  @ApiProperty({ type: [AddToCartDto] })
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => AddToCartDto)
  items!: AddToCartDto[];
}

export class ApplyCouponDto {
  @ApiProperty({ example: 'WELCOME10' })
  @IsString()
  code!: string;
}
