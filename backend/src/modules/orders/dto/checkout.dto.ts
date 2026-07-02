import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsOptional, IsString, IsUUID, Length, ValidateNested } from 'class-validator';
import { PAYMENT_METHOD, type PaymentMethod } from '@nati/shared';

// Only gateway-backed + COD are accepted at checkout for now.
const CHECKOUT_METHODS: PaymentMethod[] = [PAYMENT_METHOD.RAZORPAY, PAYMENT_METHOD.COD];

export class ShippingAddressDto {
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
}

export class CheckoutDto {
  @ApiPropertyOptional({ description: 'Saved address id (or provide shippingAddress)' })
  @IsOptional()
  @IsUUID()
  addressId?: string;

  @ApiPropertyOptional({ type: ShippingAddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress?: ShippingAddressDto;

  @ApiProperty({ enum: CHECKOUT_METHODS })
  @IsIn(CHECKOUT_METHODS)
  paymentMethod!: PaymentMethod;
}
