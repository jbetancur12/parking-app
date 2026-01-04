# Input Validation Implementation Guide

This document explains how to apply the new validation system to existing controllers.

## Overview

We've implemented a comprehensive input validation system using `class-validator` and `class-transformer` to prevent injection attacks and ensure data integrity.

## Components

### 1. Validation Middleware (`middleware/validation.middleware.ts`)
- `validateBody()` - Validates request body
- `validateQuery()` - Validates query parameters
- `validateParams()` - Validates route parameters

### 2. DTOs (Data Transfer Objects) in `dtos/`
- `auth.dto.ts` - Login, Register, ChangePassword
- `parking.dto.ts` - Entry, Exit, Search
- `user.dto.ts` - Create, Update, AssignLocations
- `monthly.dto.ts` - Create, Renew, Update
- `shift.dto.ts` - Open, Close, Expenses, Income

## How to Apply Validation

### Example: Auth Controller

**Before:**
```typescript
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    // ... logic
});
```

**After:**
```typescript
import { validateBody } from '../middleware/validation.middleware';
import { LoginDto } from '../dtos/auth.dto';

router.post('/login', validateBody(LoginDto), async (req, res) => {
    const { email, password } = req.body; // Now validated and type-safe
    // ... logic
});
```

### Example: Parking Controller

**Before:**
```typescript
router.post('/entry', authenticateToken, async (req, res) => {
    const { plate, vehicleType } = req.body;
    // ... logic
});
```

**After:**
```typescript
import { validateBody } from '../middleware/validation.middleware';
import { CreateParkingEntryDto } from '../dtos/parking.dto';

router.post('/entry', 
    authenticateToken, 
    validateBody(CreateParkingEntryDto), 
    async (req, res) => {
        const { plate, vehicleType } = req.body; // Validated
        // ... logic
    }
);
```

## Priority Order for Implementation

### 🔴 Critical (Implement First)
1. **Auth Routes** (`auth.controller.ts`)
   - Login
   - Register
   - Change Password

2. **User Routes** (`user.controller.ts`)
   - Create User
   - Update User
   - Assign Locations

3. **Parking Routes** (`parking.controller.ts`)
   - Create Entry
   - Create Exit
   - Exit Preview

### 🟡 High Priority
4. **Monthly Routes** (`monthly.controller.ts`)
   - Create Client
   - Renew Client
   - Update Client

5. **Shift Routes** (`shift.controller.ts`)
   - Open Shift
   - Close Shift

6. **Expense Routes** (`expense.controller.ts`)
   - Create Expense

### 🟢 Medium Priority
7. **Wash Routes** (`wash.controller.ts`)
8. **Sale Routes** (`sale.controller.ts`)
9. **Tariff Routes** (`tariff.controller.ts`)
10. **Setting Routes** (`setting.controller.ts`)

### 🔵 Low Priority
11. **Report Routes** (`report.controller.ts`) - Mostly GET requests
12. **Stats Routes** (`stats.controller.ts`) - Mostly GET requests
13. **Transaction Routes** (`transaction.controller.ts`) - Mostly GET requests

## Validation Features

### String Validation
```typescript
@IsString()
@MinLength(3)
@MaxLength(50)
@Matches(/^[a-zA-Z0-9_-]+$/)
username!: string;
```

### Number Validation
```typescript
@IsNumber()
@Min(0)
@Max(99999999)
amount!: number;
```

### Enum Validation
```typescript
@IsEnum(['CAR', 'MOTORCYCLE', 'OTHER'])
vehicleType!: string;
```

### Email Validation
```typescript
@IsEmail()
@MaxLength(255)
email!: string;
```

### Optional Fields
```typescript
@IsOptional()
@IsString()
notes?: string;
```

### Array Validation
```typescript
@IsArray()
@IsNumber({}, { each: true })
locationIds!: number[];
```

## Error Response Format

When validation fails, the API returns:

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "constraints": {
        "isEmail": "Email must be a valid email address"
      },
      "value": "invalid-email"
    },
    {
      "field": "password",
      "constraints": {
        "minLength": "Password must be at least 8 characters long"
      }
    }
  ]
}
```

## Security Benefits

✅ **Prevents SQL Injection:** Input sanitization
✅ **Prevents XSS:** String length and pattern validation
✅ **Prevents Type Confusion:** Strong typing
✅ **Prevents Overflow:** Number range validation
✅ **Whitelist Approach:** Only allowed fields pass through
✅ **Automatic Sanitization:** Strips unknown properties

## Testing Validation

### Valid Request
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Test123!"}'
```

### Invalid Request (triggers validation)
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"123"}'
```

## Next Steps

1. ✅ Install dependencies (DONE)
2. ✅ Create validation middleware (DONE)
3. ✅ Create DTOs for critical endpoints (DONE)
4. ⏳ Apply validation to auth.controller.ts
5. ⏳ Apply validation to user.controller.ts
6. ⏳ Apply validation to parking.controller.ts
7. ⏳ Apply validation to remaining controllers
8. ⏳ Test all endpoints
9. ⏳ Update API documentation

## Additional DTOs Needed

Create these as you implement validation for other controllers:

- `wash.dto.ts` - Wash service operations
- `sale.dto.ts` - POS sales
- `tariff.dto.ts` - Tariff configuration
- `setting.dto.ts` - System settings
- `agreement.dto.ts` - Discount agreements
- `product.dto.ts` - Product management
- `admin.dto.ts` - Admin operations (tenants, locations)

## Tips

1. **Start with POST/PUT routes** - These are most vulnerable
2. **Use strict validation** - Better to reject invalid data than accept it
3. **Provide clear error messages** - Helps frontend developers
4. **Test edge cases** - Empty strings, null, undefined, very long strings
5. **Document validation rules** - Keep this guide updated

---

**Last Updated:** January 4, 2026
