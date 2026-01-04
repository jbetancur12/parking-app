# Hooks Directory - Organization Guide

This directory contains **30 custom hooks** that encapsulate business logic, data fetching, form management, and UI interactions.

---

## 📂 Hook Categories

### 🏢 Business Logic Hooks (10)
Complex hooks managing core business operations and workflows.

| Hook | Complexity | Lines | Purpose |
|------|-----------|-------|---------|
| `useParkingPage` | ⭐⭐⭐ High | 382 | Vehicle entry/exit, offline mode, printing |
| `useExitCalculations` | ⭐⭐⭐ High | 127 | Exit pricing, discounts, agreements, loyalty |
| `useMonthlyClientActions` | ⭐⭐ Medium | 201 | Monthly client CRUD, renewals, printing |
| `useWashPage` | ⭐⭐ Medium | ~200 | Wash service management |
| `useIncomesPage` | ⭐⭐ Medium | ~180 | Income tracking, POS, manual entries |
| `useExpensesPage` | ⭐⭐ Medium | ~150 | Expense management |
| `useMonthlyClients` | ⭐⭐ Medium | ~140 | Monthly client data fetching |
| `useShiftActions` | ⭐⭐ Medium | 88 | Shift open/close, financial tracking |
| `useInventoryPage` | ⭐ Low | ~120 | Inventory CRUD operations |
| `useAgreementsPage` | ⭐ Low | ~100 | Discount agreements management |

### 📝 Form Hooks (3)
Hooks managing form state, validation, and submission.

| Hook | Purpose |
|------|---------|
| `useLoginFlow` | Login authentication + startup checks |
| `useRegisterFlow` | User registration form logic |
| `useEntryForm` | Vehicle entry form + auto-selection |

### 📊 Data Fetching Hooks (12)
Hooks responsible for API calls and data management.

| Hook | Purpose |
|------|---------|
| `useDashboardStats` | Dashboard statistics fetching |
| `useSuperAdminStats` | Super admin global statistics |
| `useTicketStatus` | Ticket status polling (public page) |
| `useAuditLogs` | Audit log fetching + filtering |
| `useReportsPage` | Financial reports generation |
| `useShiftHistoryPage` | Historical shift data |
| `useTransactionsPage` | Transaction history + filtering |
| `useUsersPage` | User management CRUD |
| `useLocationsPage` | Location management (admin) |
| `useTenantsPage` | Tenant management (super admin) |
| `useTenantDetail` | Single tenant details |
| `useTenantForm` | Tenant create/edit form |

### 🎨 UI/Utility Hooks (5)
Hooks for UI interactions, printing, and settings.

| Hook | Purpose |
|------|---------|
| `useAutoLogout` | Inactivity timer for auto-logout |
| `useElectronPrint` | Electron-specific printing |
| `usePrint` | Generic print functionality |
| `useSettings` | Application settings management |
| `useDashboardLogic` | Dashboard UI orchestration |

---

## 🔝 Top 5 Most Complex Hooks

These hooks have comprehensive JSDoc documentation:

### 1. **useParkingPage** (382 lines) ⭐⭐⭐
- **Purpose:** Complete parking operations workflow
- **Features:**
  - Vehicle entry/exit with validation
  - Offline mode with queue management
  - Print confirmation flows
  - Exit preview with pricing
  - Shift integration
- **Documentation:** ✅ Full JSDoc

### 2. **useMonthlyClientActions** (201 lines) ⭐⭐
- **Purpose:** Monthly client action orchestration
- **Features:**
  - Create/edit/renew clients
  - History viewing
  - Receipt printing
  - Export to Excel
- **Documentation:** ⚠️ Partial

### 3. **useWashPage** (~200 lines) ⭐⭐
- **Purpose:** Wash service management
- **Features:**
  - Service CRUD
  - Transaction tracking
  - Printing
- **Documentation:** ⚠️ Partial

### 4. **useIncomesPage** (~180 lines) ⭐⭐
- **Purpose:** Income management
- **Features:**
  - POS system
  - Manual income entry
  - Product sales
  - Printing
- **Documentation:** ⚠️ Partial

### 5. **useExitCalculations** (127 lines) ⭐⭐⭐
- **Purpose:** Complex exit pricing calculations
- **Features:**
  - Multiple discount types
  - Loyalty redemption
  - Agreement application
  - Change calculation
- **Documentation:** ✅ Full JSDoc

---

## 📖 Documentation Standards

### JSDoc Template
```typescript
/**
 * Brief description of the hook's purpose.
 * 
 * **Complexity:** High/Medium/Low
 * 
 * **Responsibilities:**
 * - Bullet point list of main responsibilities
 * 
 * @param {Type} paramName - Parameter description
 * 
 * @returns {Object} Return value description
 * @returns {Type} returns.propertyName - Property description
 * 
 * @example
 * ```tsx
 * const { state, handler } = useHookName(params);
 * ```
 */
```

---

## 🎯 Usage Guidelines

### When to Create a New Hook
✅ **DO create a hook when:**
- Logic is reused across multiple components
- Component exceeds 200 lines
- Complex state management needed
- API calls need to be isolated
- Form logic becomes complex

❌ **DON'T create a hook when:**
- Logic is only used once
- Hook would be <20 lines
- Simple useState is sufficient
- Over-abstracting simple operations

### Naming Conventions
- **Business Logic:** `use[Feature]Page` or `use[Feature]Actions`
- **Forms:** `use[Feature]Form` or `use[Feature]Flow`
- **Data:** `use[Feature]Stats` or `use[Feature]Data`
- **UI:** `use[Feature]` (generic utility)

---

## 🔄 Hook Dependencies

### Common Dependencies
- `react` - useState, useEffect, useRef, useCallback
- `sonner` - Toast notifications
- `api` - Axios instance for API calls
- Context hooks:
  - `useAuth` - Authentication state
  - `useShift` - Active shift state
  - `useOffline` - Offline mode
  - `useSaas` - Multi-tenancy

### Dependency Graph (Key Hooks)
```
useParkingPage
├── useOffline (offline queue)
├── useShift (shift validation)
├── settingService (print config)
└── tariffService (pricing)

useExitCalculations
├── tariffService (plan labels)
└── formatters (currency)

useMonthlyClientActions
├── useElectronPrint (receipts)
└── exportToExcel (data export)
```

---

## 🧪 Testing Recommendations

### Priority for Testing
1. **High Priority:** useParkingPage, useExitCalculations
2. **Medium Priority:** useMonthlyClientActions, useShiftActions
3. **Low Priority:** Simple data fetching hooks

### Test Coverage Goals
- **Business Logic Hooks:** 80%+ coverage
- **Form Hooks:** 70%+ coverage
- **Data Hooks:** 60%+ coverage
- **UI Hooks:** 50%+ coverage

---

## 📝 Maintenance Notes

### Last Updated
- **Date:** 2026-01-04
- **Total Hooks:** 30
- **Documented (JSDoc):** 2/30 (useParkingPage, useExitCalculations)
- **Average Complexity:** Medium

### Future Improvements
- [ ] Add JSDoc to remaining 3 complex hooks
- [ ] Extract common patterns into shared utilities
- [ ] Consider React Query for data fetching hooks
- [ ] Add unit tests for business logic hooks

---

## 🚀 Quick Reference

**Most Used Hooks:**
1. `useParkingPage` - Main parking operations
2. `useMonthlyClients` - Monthly client list
3. `useShiftActions` - Shift management
4. `useSettings` - App configuration

**Recently Added:**
- `useAutoLogout` - Auto-logout timer
- `useExitCalculations` - Exit pricing logic
- `useEntryForm` - Entry form state
- `useRegisterFlow` - Registration flow

**Deprecated:** None
