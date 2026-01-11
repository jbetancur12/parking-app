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
    @IsEmail({}, { message: 'Username must be a valid email address' })
    username!: string;

    @IsOptional()
    @IsString({ message: 'Password must be a string' })
    // Password length check moved to controller for invitation flow or relaxed here?
    // If we keep MinLength(6), invitation flow with randomized password must ensure it's > 6 chars.
    // Controller does: crypto.randomBytes(16).toString('hex') -> 32 chars. Safe.
    // But manual flow needs password. 
    // Wait, if isInvitation is true, password in body is optional in controller?
    // Frontend sends placeholder "tmp-invite-...".
    // So MinLength is fine.
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    @MaxLength(100, { message: 'Password must not exceed 100 characters' })
    password!: string;

    @IsEnum(['SUPER_ADMIN', 'ADMIN', 'LOCATION_MANAGER', 'OPERATOR', 'CASHIER'], {
        message: 'Invalid Role',
    })
    role!: string;

    @IsOptional()
    @IsBoolean({ message: 'isActive must be a boolean' })
    isActive?: boolean;

    @IsOptional()
    @IsBoolean({ message: 'isInvitation must be a boolean' })
    isInvitation?: boolean;

    @IsOptional()
    @IsEmail({}, { message: 'Email must be a valid email address' })
    @MaxLength(255, { message: 'Email must not exceed 255 characters' })
    email?: string; // Legacy/Additional email field? If username is email, this might be redundant but let's keep it optional.

    @IsOptional()
    @IsString({ message: 'Full name must be a string' })
    @MaxLength(255, { message: 'Full name must not exceed 255 characters' })
    fullName?: string;

    @IsOptional()
    @IsString()
    tenantId?: string;
}

/**
 * DTO for updating a user
 */
export class UpdateUserDto {
    @IsOptional()
    @IsOptional()
    @IsEmail({}, { message: 'Username must be a valid email address' })
    username?: string;

    @IsOptional()
    @IsString({ message: 'Password must be a string' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
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
