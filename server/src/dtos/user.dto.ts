import {
    IsString,
    IsEmail,
    IsEnum,
    IsBoolean,
    IsOptional,
    MinLength,
    MaxLength,
    Matches,
    IsArray,
    IsNumber,
} from 'class-validator';

/**
 * DTO for creating a user
 */
export class CreateUserDto {
    @IsString({ message: 'Username must be a string' })
    @MinLength(3, { message: 'Username must be at least 3 characters long' })
    @MaxLength(50, { message: 'Username must not exceed 50 characters' })
    @Matches(/^[a-zA-Z0-9_-]+$/, {
        message: 'Username can only contain letters, numbers, underscores, and hyphens',
    })
    username!: string;

    @IsString({ message: 'Password must be a string' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(100, { message: 'Password must not exceed 100 characters' })
    password!: string;

    @IsEnum(['SUPER_ADMIN', 'ADMIN', 'OPERATOR'], {
        message: 'Role must be SUPER_ADMIN, ADMIN, or OPERATOR',
    })
    role!: string;

    @IsOptional()
    @IsBoolean({ message: 'isActive must be a boolean' })
    isActive?: boolean;

    @IsOptional()
    @IsEmail({}, { message: 'Email must be a valid email address' })
    @MaxLength(255, { message: 'Email must not exceed 255 characters' })
    email?: string;

    @IsOptional()
    @IsString({ message: 'Full name must be a string' })
    @MaxLength(255, { message: 'Full name must not exceed 255 characters' })
    fullName?: string;
}

/**
 * DTO for updating a user
 */
export class UpdateUserDto {
    @IsOptional()
    @IsString({ message: 'Username must be a string' })
    @MinLength(3, { message: 'Username must be at least 3 characters long' })
    @MaxLength(50, { message: 'Username must not exceed 50 characters' })
    @Matches(/^[a-zA-Z0-9_-]+$/, {
        message: 'Username can only contain letters, numbers, underscores, and hyphens',
    })
    username?: string;

    @IsOptional()
    @IsString({ message: 'Password must be a string' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(100, { message: 'Password must not exceed 100 characters' })
    password?: string;

    @IsOptional()
    @IsEnum(['SUPER_ADMIN', 'ADMIN', 'OPERATOR'], {
        message: 'Role must be SUPER_ADMIN, ADMIN, or OPERATOR',
    })
    role?: string;

    @IsOptional()
    @IsBoolean({ message: 'isActive must be a boolean' })
    isActive?: boolean;

    @IsOptional()
    @IsEmail({}, { message: 'Email must be a valid email address' })
    @MaxLength(255, { message: 'Email must not exceed 255 characters' })
    email?: string;

    @IsOptional()
    @IsString({ message: 'Full name must be a string' })
    @MaxLength(255, { message: 'Full name must not exceed 255 characters' })
    fullName?: string;
}

/**
 * DTO for assigning locations to a user
 */
export class AssignLocationsDto {
    @IsArray({ message: 'Location IDs must be an array' })
    @IsNumber({}, { each: true, message: 'Each location ID must be a number' })
    locationIds!: number[];
}
