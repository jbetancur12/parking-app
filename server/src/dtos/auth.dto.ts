import { IsString, IsEmail, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';

/**
 * DTO for user login
 */
export class LoginDto {
    @IsString({ message: 'Username must be a string' })
    @MinLength(3, { message: 'Username must be at least 3 characters long' })
    @MaxLength(50, { message: 'Username must not exceed 50 characters' })
    username!: string;

    @IsString({ message: 'Password must be a string' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    @MaxLength(100, { message: 'Password must not exceed 100 characters' })
    password!: string;
}

/**
 * DTO for user registration
 */
export class RegisterDto {
    @IsEmail({}, { message: 'Email must be a valid email address' })
    @MaxLength(255, { message: 'Email must not exceed 255 characters' })
    email!: string;

    @IsString({ message: 'Password must be a string' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(100, { message: 'Password must not exceed 100 characters' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    })
    password!: string;

    @IsString({ message: 'Username must be a string' })
    @MinLength(3, { message: 'Username must be at least 3 characters long' })
    @MaxLength(50, { message: 'Username must not exceed 50 characters' })
    @Matches(/^[a-zA-Z0-9_-]+$/, {
        message: 'Username can only contain letters, numbers, underscores, and hyphens',
    })
    username!: string;

    @IsString({ message: 'Company name must be a string' })
    @MinLength(3, { message: 'Company name must be at least 3 characters long' })
    @MaxLength(255, { message: 'Company name must not exceed 255 characters' })
    companyName!: string;

    @IsOptional()
    @IsString({ message: 'Full name must be a string' })
    @MaxLength(255, { message: 'Full name must not exceed 255 characters' })
    fullName?: string;
}

/**
 * DTO for password change
 */
export class ChangePasswordDto {
    @IsOptional()
    userId?: number;

    @IsOptional()
    @IsString({ message: 'Current password must be a string' })
    @MinLength(6, { message: 'Current password must be at least 6 characters long' })
    currentPassword?: string;

    @IsString({ message: 'New password must be a string' })
    @MinLength(6, { message: 'New password must be at least 6 characters long' })
    @MaxLength(100, { message: 'New password must not exceed 100 characters' })
    newPassword!: string;
}
