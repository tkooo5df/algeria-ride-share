# Multi-Account Support for Local Testing

## Overview
This feature allows users to create and manage multiple local accounts for testing purposes. Each account can be switched between without needing to log out and log back in, making it easier to test the application with different user roles.

## Features Implemented

### 1. Account Management System
- **Local Account Storage**: Accounts are stored in localStorage with their credentials
- **Account Switching**: Users can switch between saved accounts instantly
- **Credential Persistence**: Passwords are securely stored for automatic login

### 2. Enhanced Authentication Flow
- **Account Creation**: New accounts are automatically saved during signup
- **Account Switching**: Users can switch between accounts without re-entering passwords
- **Test Account Integration**: Existing test accounts remain accessible

### 3. User Interface Components
- **Account Management Panel**: Shows all saved accounts with role indicators
- **Quick Switch Buttons**: One-click account switching in the login page
- **Dashboard Integration**: Account management accessible from the user dashboard

## Technical Implementation

### 1. useLocalAuth Hook Modifications
The `useLocalAuth` hook was enhanced with the following new functionality:

```typescript
// New state for managing accounts
const [accounts, setAccounts] = useState<LocalAccount[]>([]);

// New methods
const saveAccount = (email: string, password: string, role: 'driver' | 'passenger' | 'admin') => { ... }
const switchAccount = async (email: string) => { ... }
```

### 2. SignUp Page Integration
- Accounts are automatically saved during the signup process
- Credentials are stored securely in localStorage
- Users can create multiple accounts with different roles

### 3. SignIn Page Enhancement
- Added "Saved Accounts" section showing all locally stored accounts
- One-click account switching without password entry
- Visual indicators for current account

### 4. AccountManagement Component
- Dedicated component for managing multiple accounts
- Shows all saved accounts with role-specific icons
- Allows switching between accounts
- Provides account deletion functionality (UI only in this version)

## Environment Configuration

### Environment Variables
The feature requires the following environment variable to be set:
```
VITE_LOCAL=true
```

This variable should be added to a `.env` file in the project root directory.

### Vite Configuration
The application uses `import.meta.env.VITE_LOCAL` instead of `process.env.NEXT_PUBLIC_LOCAL` to properly work with Vite's environment variable system.

## Usage Instructions

### Creating New Accounts
1. Navigate to the signup page (`/auth/signup`)
2. Fill in account details (email, password, role)
3. Complete the signup process
4. The account will be automatically saved for future use

### Switching Between Accounts
1. From the login page:
   - Use the "Saved Accounts" section to switch directly
2. From the dashboard:
   - Access the Account Management panel
   - Click "تبديل" (Switch) next to any saved account

### Testing with Multiple Roles
- Create accounts with different roles (driver, passenger, admin)
- Switch between roles to test different parts of the application
- Each role has specific permissions and dashboard views

## Security Considerations

### Local Storage Security
- Passwords are stored in localStorage (not recommended for production)
- This is acceptable for local testing only
- In production, use proper authentication mechanisms

### Data Isolation
- Each account maintains separate session data
- Switching accounts does not mix user data
- Sessions are properly cleared when switching

## Future Improvements

### Enhanced Security
- Implement proper password hashing for local storage
- Add encryption for stored credentials
- Implement session timeout for security

### Account Management Features
- Add account deletion functionality
- Implement password change for local accounts
- Add account export/import features

### UI/UX Improvements
- Add account avatars for visual distinction
- Implement account grouping by role
- Add search functionality for many accounts

## Testing with Friends

### Setup Instructions
1. Each friend creates their own account on the same device
2. Friends can switch between accounts to test different scenarios
3. Multiple browser instances can be used for concurrent testing

### Collaboration Features
- Shared test data can be created and modified
- Different roles can interact with the same data
- Real-time testing of multi-user scenarios

## Files Modified
1. `src/hooks/useLocalAuth.ts` - Core authentication logic
2. `src/pages/SignUp.tsx` - Account saving during signup
3. `src/pages/SignIn.tsx` - Account switching UI
4. `src/pages/UserDashboard.tsx` - Account management integration
5. `src/components/AccountManagement.tsx` - New component for account management

## New Files Created
1. `.env` - Environment configuration file
2. `MULTI_ACCOUNT_SUPPORT.md` - This documentation file

## Conclusion
This multi-account support feature significantly improves the local testing experience by allowing users to create and switch between multiple accounts without the need for external authentication services. It's particularly useful for developers and testers who need to verify functionality across different user roles.