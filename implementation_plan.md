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
### Backend

#### [MODIFY] [ordersV2.js](file:///Users/joelyan/Downloads/youfujia-home-services%20%283%29/backend/src/routes/ordersV2.js)
- **Fix user note visibility**: Update `GET /api/orders-v2/:id/provider-view` to include `user_note: order.user_note`.
- **New Messaging Endpoints**:
    - `GET /api/orders-v2/:id/messages`: Retrieve message history.
    - `POST /api/orders-v2/:id/messages`: Send a message and trigger an SMS notification to the recipient.
- **Robustness in refusal logic**: Ensure the `refuse-start` endpoint processes and returns errors correctly.

#### [NEW] [create_order_messages.sql](file:///Users/joelyan/Downloads/youfujia-home-services%20%283%29/backend/database/create_order_messages.sql)
- Create `order_messages` table to store persistent chat history.

### Frontend Components

#### [MODIFY] [provider-response.vue](file:///Users/joelyan/Downloads/youfujia-home-services%20%283%29/uniapp-version/src/pages/order/provider-response.vue)
- Ensure `order.user_note` is correctly displayed.
- Replace the single-message "留言沟通" modal with a full chat history and input field.

#### [MODIFY] [CustomServiceDetailPage.vue](file:///Users/joelyan/Downloads/youfujia-home-services%20%283%29/uniapp-version/src/components/CustomServiceDetailPage.vue)
- Add a "沟通" (Chat) section where the user can see provider messages and reply in-app.

#### [MODIFY] [ServiceTimeline.vue](file:///Users/joelyan/Downloads/youfujia-home-services%20%283%29/uniapp-version/src/components/ServiceTimeline.vue)
- **Improve Rejection Display**: 
    - Detect rejection records (where `description` contains "拒绝开工") and label them as "拒绝开工" instead of "服务已开始".
    - Use a red/alert icon and background for rejections to make them stand out.
    - Ensure `submitted_by` is considered for future-proofing.

#### [MODIFY] [service-confirm.vue](file:///Users/joelyan/Downloads/youfujia-home-services%20%283%29/uniapp-version/src/pages/order/service-confirm.vue)
- **Fix "Confirm Rejection" button**:
    - Use `ordersV2Api.refuseStart` instead of direct `uni.request` for better error handling and consistency.
    - Fix CSS for `.btn-disabled` (missing definition) and remove incorrect `[disabled]` attribute selectors.
    - Add `pointer-events: none` to the disabled state.

## Verification Plan

### Automated Tests
- Use `browser_subagent` to:
    1. Verify `user_note` is visible in the provider response page.
    2. Simulate a provider sending a message and verify it appears in the user's detail page.
    3. Simulate a user replying and verify it appears in the provider's view.
    4. Verify the "Confirm Rejection" modal button works correctly in `service-confirm.vue`.

### Manual Verification
- Verify the real-time feel of the chat and the quality of SMS notifications.
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
