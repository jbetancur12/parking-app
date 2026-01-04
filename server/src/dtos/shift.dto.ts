import {
    IsString,
    IsNumber,
    IsEnum,
    IsOptional,
    Min,
    Max,
    MaxLength,
    IsBoolean,
} from 'class-validator';

/**
 * DTO for opening a shift
 */
export class OpenShiftDto {
    @IsNumber({}, { message: 'Base amount must be a number' })
    @Min(0, { message: 'Base amount cannot be negative' })
    @Max(99999999, { message: 'Base amount is too large' })
    baseAmount!: number;

    @IsNumber({}, { message: 'Location ID must be a number' })
    @Min(1, { message: 'Location ID must be at least 1' })
    locationId!: number;
}

/**
 * DTO for closing a shift
 */
export class CloseShiftDto {
    @IsNumber({}, { message: 'Declared amount must be a number' })
    @Min(0, { message: 'Declared amount cannot be negative' })
    @Max(99999999, { message: 'Declared amount is too large' })
    declaredAmount!: number;

    @IsOptional()
    @IsString({ message: 'Notes must be a string' })
    @MaxLength(1000, { message: 'Notes must not exceed 1000 characters' })
    notes?: string;
}

/**
 * DTO for creating an expense
 */
export class CreateExpenseDto {
    @IsString({ message: 'Description must be a string' })
    @MaxLength(255, { message: 'Description must not exceed 255 characters' })
    description!: string;

    @IsNumber({}, { message: 'Amount must be a number' })
    @Min(0.01, { message: 'Amount must be greater than 0' })
    @Max(99999999, { message: 'Amount is too large' })
    amount!: number;

    @IsEnum(['CASH', 'TRANSFER', 'CARD'], {
        message: 'Payment method must be CASH, TRANSFER, or CARD',
    })
    paymentMethod!: string;

    @IsOptional()
    @IsString({ message: 'Category must be a string' })
    @MaxLength(100, { message: 'Category must not exceed 100 characters' })
    category?: string;
}

/**
 * DTO for creating a manual income
 */
export class CreateIncomeDto {
    @IsString({ message: 'Description must be a string' })
    @MaxLength(255, { message: 'Description must not exceed 255 characters' })
    description!: string;

    @IsNumber({}, { message: 'Amount must be a number' })
    @Min(0.01, { message: 'Amount must be greater than 0' })
    @Max(99999999, { message: 'Amount is too large' })
    amount!: number;

    @IsEnum(['CASH', 'TRANSFER', 'CARD'], {
        message: 'Payment method must be CASH, TRANSFER, or CARD',
    })
    paymentMethod!: string;

    @IsOptional()
    @IsString({ message: 'Category must be a string' })
    @MaxLength(100, { message: 'Category must not exceed 100 characters' })
    category?: string;
}
