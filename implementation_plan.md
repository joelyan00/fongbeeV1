# Sales & Referral System Implementation

## Completed Features
1. **Sales Role Integration**
   - Updated `users` table to support 'sales' role.
   - Added `sales_profiles` table for tracking commission rates and earnings.
   - Added `commission_logs` table for audit trails.

2. **Backend Logic**
   - **Registration**: Updated `/register` endpoint to automatically:
     - Detect 'sales' role and create a sales profile.
     - Generate unique referral codes.
     - Bind new users/providers to a referrer if `referralCode` is provided.
   - **Sales API**: Created `/api/sales/profile` and `/api/sales/commissions`.
   - **Commission Logic**: Updated `/api/orders/:id/confirm-start` (when deposit/fee is paid) to:
     - Calculate platform revenue (fee).
     - Calculate sales commission (Fee * Rate).
     - Credit commission to sales wallet.
     - Log transaction.

3. **Frontend Implementation**
   - **Provider Application**: 
     - Auto-detects `?ref=CODE` from URL.
     - Added "Invite Code" field in registration form.
   - **Sales Dashboard**:
     - New page at `/sales-dashboard`.
     - Displays Profile, Referral Link (click to copy), Stats (Earnings, Balance), and Commission Logs.
   - **Sales Registration**:
     - Added "Register as Sales Partner" checkbox to the main Register page.
   - **Navigation**:
     - Added "Sales Center" link in Header for sales users.

## How to Test
1. **Register a Sales User**:
   - Go to `/register`.
   - Fill in details and check "Register as Sales Partner".
   - Login (if not auto-logged in).
   - Go to "Sales Center" (in header) or `/sales-dashboard`.
   - Copy your **Referral Link**.

2. **Refer a Provider**:
   - Open the Referral Link in a new incognito window (or logout).
   - You will see the "Service Provider Application" page.
   - The "Invite Code" field should be auto-filled (read-only).
   - Complete the application.

3. **Approve/Process Provider (Backend/Admin)**:
   - (Assuming admin approves provider logic exists or is auto-approved).
   - Provider logs in.

4. **Generate Commission**:
   - Provider gets an order (or create one using test scripts).
   - **Step 1**: User pays deposit (`/api/orders/:id/pay-deposit`).
   - **Step 2**: User confirms start (`/api/orders/:id/confirm-start`).
     - **Check**: Sales user should see commission in their dashboard.

## Next Steps (Not Implemented)
- **Withdrawal System**: Logic for Sales users to request payout of their balance.
- **Admin Management**: Admin page to view/manage sales partners and adjust commission rates.
