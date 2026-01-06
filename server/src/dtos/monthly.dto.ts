import {
    IsString,
    IsNumber,
    IsEnum,
    IsOptional,
    Min,
    Max,
    MaxLength,
    Matches,
    IsBoolean,
    IsDateString,
} from 'class-validator';

/**
 * DTO for creating a monthly client
 */
export class CreateMonthlyClientDto {
    @IsString({ message: 'Plate must be a string' })
    @MaxLength(20, { message: 'Plate must not exceed 20 characters' })
    @Matches(/^[A-Z0-9-]+$/i, {
        message: 'Plate can only contain letters, numbers, and hyphens',
    })
    plate!: string;

    @IsString({ message: 'Name must be a string' })
    @MaxLength(255, { message: 'Name must not exceed 255 characters' })
    name!: string;

    @IsOptional()
    @IsString({ message: 'Phone must be a string' })
    @MaxLength(20, { message: 'Phone must not exceed 20 characters' })
    @Matches(/^[0-9+\-() ]+$/, {
        message: 'Phone can only contain numbers, +, -, (, ), and spaces',
    })
    phone?: string;

    @IsEnum(['CAR', 'MOTORCYCLE', 'OTHER'], {
        message: 'Vehicle type must be CAR, MOTORCYCLE, or OTHER',
    })
    vehicleType!: string;

    @IsNumber({}, { message: 'Monthly rate must be a number' })
    @Min(0, { message: 'Monthly rate cannot be negative' })
    @Max(99999999, { message: 'Monthly rate is too large' })
    monthlyRate!: number;

    @IsEnum(['CASH', 'TRANSFER', 'CARD'], {
        message: 'Payment method must be CASH, TRANSFER, or CARD',
    })
    paymentMethod!: string;

    @IsOptional()
    @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
    startDate?: string;

    @IsOptional()
    @IsEnum(['MONTH', 'WEEK', 'TWO_WEEKS'], {
        message: 'Billing period must be MONTH, WEEK, or TWO_WEEKS'
    })
    billingPeriod?: string;
}

/**
 * DTO for renewing a monthly client
 */
export class RenewMonthlyClientDto {
    @IsNumber({}, { message: 'Amount must be a number' })
    @Min(0, { message: 'Amount cannot be negative' })
    @Max(99999999, { message: 'Amount is too large' })
    amount!: number;

    @IsEnum(['CASH', 'TRANSFER', 'CARD'], {
        message: 'Payment method must be CASH, TRANSFER, or CARD',
    })
    paymentMethod!: string;

    @IsOptional()
    @IsEnum(['MONTH', 'WEEK', 'TWO_WEEKS'], {
        message: 'Billing period must be MONTH, WEEK, or TWO_WEEKS'
    })
    billingPeriod?: string;
}

/**
 * DTO for updating a monthly client
 */
export class UpdateMonthlyClientDto {
    @IsOptional()
    @IsString({ message: 'Name must be a string' })
    @MaxLength(255, { message: 'Name must not exceed 255 characters' })
    name?: string;

    @IsOptional()
    @IsString({ message: 'Phone must be a string' })
    @MaxLength(20, { message: 'Phone must not exceed 20 characters' })
    @Matches(/^[0-9+\-() ]+$/, {
        message: 'Phone can only contain numbers, +, -, (, ), and spaces',
    })
    phone?: string;

    @IsOptional()
    @IsNumber({}, { message: 'Monthly rate must be a number' })
    @Min(0, { message: 'Monthly rate cannot be negative' })
    @Max(99999999, { message: 'Monthly rate is too large' })
    monthlyRate?: number;

    @IsOptional()
    @IsBoolean({ message: 'isActive must be a boolean' })
    isActive?: boolean;
}
