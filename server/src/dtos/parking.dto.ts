import {
    IsString,
    IsEnum,
    IsOptional,
    IsNumber,
    Min,
    Max,
    MaxLength,
    Matches,
    IsBoolean,
    IsDateString,
} from 'class-validator';

/**
 * DTO for creating a parking entry
 */
export class CreateParkingEntryDto {
    @IsString({ message: 'Plate must be a string' })
    @MaxLength(20, { message: 'Plate must not exceed 20 characters' })
    @Matches(/^[A-Z0-9-]+$/i, {
        message: 'Plate can only contain letters, numbers, and hyphens',
    })
    plate!: string;

    @IsEnum(['CAR', 'MOTORCYCLE', 'OTHER'], {
        message: 'Vehicle type must be CAR, MOTORCYCLE, or OTHER',
    })
    vehicleType!: string;

    @IsOptional()
    @IsEnum(['HOUR', 'DAY'], {
        message: 'Plan type must be HOUR or DAY',
    })
    planType?: string;

    @IsOptional()
    @IsString({ message: 'Ticket number must be a string' })
    @MaxLength(50, { message: 'Ticket number must not exceed 50 characters' })
    ticketNumber?: string;

    @IsOptional()
    @IsDateString({}, { message: 'Entry time must be a valid ISO date string' })
    entryTime?: string;
}

/**
 * DTO for creating a parking exit
 */
export class CreateParkingExitDto {
    @IsOptional()
    @IsNumber({}, { message: 'Session ID must be a number' })
    @Min(1, { message: 'Session ID must be at least 1' })
    sessionId?: number;

    @IsOptional()
    @IsString()
    plate?: string;

    @IsEnum(['CASH', 'TRANSFER', 'CARD'], {
        message: 'Payment method must be CASH, TRANSFER, or CARD',
    })
    paymentMethod!: string;

    @IsOptional()
    @IsNumber({}, { message: 'Discount must be a number' })
    @Min(0, { message: 'Discount cannot be negative' })
    discount?: number;

    @IsOptional()
    @IsString({ message: 'Discount reason must be a string' })
    @MaxLength(255, { message: 'Discount reason must not exceed 255 characters' })
    discountReason?: string;

    @IsOptional()
    @IsNumber({}, { message: 'Agreement ID must be a number' })
    @Min(1, { message: 'Agreement ID must be at least 1' })
    agreementId?: number;

    @IsOptional()
    @IsBoolean({ message: 'Redeem must be a boolean' })
    redeem?: boolean;

    @IsOptional()
    @IsNumber({}, { message: 'Cash received must be a number' })
    @Min(0, { message: 'Cash received cannot be negative' })
    cashReceived?: number;
}

/**
 * DTO for exit preview
 */
export class ExitPreviewDto {
    @IsNumber({}, { message: 'Session ID must be a number' })
    @Min(1, { message: 'Session ID must be at least 1' })
    sessionId!: number;
}

/**
 * DTO for searching parking sessions
 */
export class SearchParkingDto {
    @IsOptional()
    @IsString({ message: 'Search term must be a string' })
    @MaxLength(50, { message: 'Search term must not exceed 50 characters' })
    search?: string;

    @IsOptional()
    @IsEnum(['active', 'completed', 'all'], {
        message: 'Status must be active, completed, or all',
    })
    status?: string;

    @IsOptional()
    @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
    startDate?: string;

    @IsOptional()
    @IsDateString({}, { message: 'End date must be a valid ISO date string' })
    endDate?: string;
}
