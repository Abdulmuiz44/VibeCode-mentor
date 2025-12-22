# Lemonsqueezy Payment Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         VIBECODE MENTOR PAYMENT FLOW                        │
└─────────────────────────────────────────────────────────────────────────────┘

                              USER INITIATES PAYMENT
                                      │
                                      ▼
                    ┌──────────────────────────────────┐
                    │   app/profile/page.tsx           │
                    │   "Upgrade" Button               │
                    └──────────────┬───────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────────┐
                    │  ProUpgradeModal.tsx             │
                    │  - Shows features                │
                    │  - Payment method selection      │
                    │  - Lemonsqueezy (default)        │
                    │  - Flutterwave (fallback)        │
                    └──────────────┬───────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────────┐
                    │  LemonsqueezyButton.tsx          │
                    │  - Collects email                │
                    │  - Handles checkout init         │
                    │  - Error states                  │
                    └──────────────┬───────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────────┐
                    │  POST /api/lemonsqueezy/checkout │
                    │  (Route Handler)                 │
                    │                                  │
                    │  1. Validate email               │
                    │  2. Fetch products from LS       │
                    │  3. Find Pro product variant     │
                    │  4. Create checkout session      │
                    │  5. Return checkout URL          │
                    └──────────────┬───────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────────┐
                    │  Lemonsqueezy API                │
                    │  POST /v1/checkouts              │
                    │                                  │
                    │  - Creates session               │
                    │  - Generates checkout link       │
                    │  - Associates order with product │
                    └──────────────┬───────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────────┐
                    │  Browser Redirect                │
                    │  window.location.href = URL      │
                    └──────────────┬───────────────────┘
                                   │
                                   ▼
         ┌─────────────────────────────────────────────────────┐
         │   LEMONSQUEEZY CHECKOUT PAGE                        │
         │   - User enters card details                        │
         │   - User completes payment                          │
         │   - Lemonsqueezy processes payment                  │
         └─────────────────┬───────────────────────────────────┘
                           │
                           ├─────────────────────────────────┐
                           │                                 │
                     PAYMENT SUCCESS                  PAYMENT FAILS
                           │                                 │
                           ▼                                 ▼
         ┌──────────────────────────────┐  ┌─────────────────────────┐
         │ Lemonsqueezy Sends Webhook   │  │ Return to Checkout      │
         │ Event: order_completed       │  │ Show error to user      │
         │                              │  │ Prompt to retry         │
         │ POST /api/lemonsqueezy/      │  └─────────────────────────┘
         │       webhook                │
         └──────────────┬───────────────┘
                        │
                        ▼
         ┌──────────────────────────────────────────────────┐
         │  WEBHOOK HANDLER (route.ts)                      │
         │                                                  │
         │  1. Parse request body                           │
         │  2. Verify HMAC-SHA256 signature                 │
         │  3. Extract order data (amount, customer, etc)   │
         │  4. Check for duplicates (prevent double charge) │
         │  5. Record payment in Supabase                   │
         │  6. Upgrade user to Pro status                   │
         │  7. Send confirmation email (optional)           │
         │  8. Return 200 OK                                │
         └──────────────┬───────────────────────────────────┘
                        │
            ┌───────────┴────────────┐
            │                        │
            ▼                        ▼
    ┌──────────────────┐   ┌──────────────────────┐
    │  Supabase        │   │  Payment Recorded    │
    │  Database        │   │                      │
    │                  │   │  - user_id           │
    │  Users table:    │   │  - amount: $5.00     │
    │  is_pro = true   │   │  - transaction_id    │
    │                  │   │  - payment_method    │
    │  Payments table: │   │  - timestamp         │
    │  [New record]    │   │  - status: completed │
    └──────────────────┘   └──────────────────────┘
                        │
                        ▼
         ┌──────────────────────────────────┐
         │  Redirect to Success Page         │
         │  /payment/success                │
         │                                  │
         │  - Show success message           │
         │  - List Pro features              │
         │  - Redirect to dashboard after 3s │
         └──────────────────────────────────┘
```

---

## Component Relationship Diagram

```
┌─────────────────────────────────────────────────────┐
│                  Frontend Components                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  app/page.tsx                                       │
│  └── app/home/HomeClient.tsx                        │
│      └── ProUpgradeModal (Context Provider)         │
│          ├── ProUpgradeModalProvider                │
│          │   └── useProUpgradeModal() hook          │
│          │                                          │
│          └── Modal Content                          │
│              ├── Feature Cards                      │
│              ├── Payment Method Selection           │
│              │   ├── [Radio] Lemonsqueezy (default) │
│              │   ├── [Radio] Flutterwave            │
│              │   └── [Radio] Other (coming soon)    │
│              │                                      │
│              └── Payment Buttons                    │
│                  ├── LemonsqueezyButton ✨          │
│                  ├── Flutterwave Handler            │
│                  └── (Old PayPalButton removed)     │
│                                                     │
└─────────────────────────────────────────────────────┘
         │
         │ Calls
         ▼
┌─────────────────────────────────────────────────────┐
│                  API Endpoints                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  app/api/lemonsqueezy/                              │
│  ├── checkout/route.ts ✨                           │
│  │   POST → Create checkout session                 │
│  │   ├── Validate email                             │
│  │   ├── Fetch products from Lemonsqueezy           │
│  │   ├── Create checkout                            │
│  │   └── Return { checkoutUrl }                     │
│  │                                                  │
│  └── webhook/route.ts ✨                            │
│      POST → Receive order completion                │
│      ├── Verify signature                           │
│      ├── Parse webhook payload                      │
│      ├── Record payment                             │
│      └── Upgrade user to Pro                        │
│                                                     │
│  (Old PayPal endpoints removed)                     │
│                                                     │
└─────────────────────────────────────────────────────┘
         │
         │ Calls
         ▼
┌─────────────────────────────────────────────────────┐
│              External Services                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🔷 Lemonsqueezy API                                │
│     ├── GET /stores/{id}/products                   │
│     ├── POST /checkouts                             │
│     └── Webhooks → order_completed                  │
│                                                     │
│  📦 Supabase (Database)                             │
│     ├── users table (is_pro field)                  │
│     └── payments table (transaction records)        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
FRONTEND                    BACKEND                    EXTERNAL
──────────────────────────────────────────────────────────────────

User Action
    │
    └─→ [1] Click "Upgrade"
        │
        └─→ [2] Open Modal
            │
            └─→ [3] Select Lemonsqueezy
                │
                └─→ [4] Click "Checkout"
                    │
                    └─→ LemonsqueezyButton
                        │
                        ├─→ [5] Collect: email, userId
                        │
                        └─→ POST /api/lemonsqueezy/checkout
                            │
                            ├─→ [6] API validates input
                            │
                            ├─→ [7] Fetch products
                            │   │
                            │   └─→ Lemonsqueezy API
                            │       GET /stores/{id}/products
                            │       │
                            │       └─→ [8] Returns product data
                            │
                            ├─→ [9] Create checkout session
                            │   │
                            │   └─→ Lemonsqueezy API
                            │       POST /checkouts
                            │       │
                            │       └─→ [10] Returns checkout URL
                            │
                            └─→ [11] Return URL to frontend
                                │
                                └─→ window.location.href
                                    │
                                    └─→ [12] Redirect to Lemonsqueezy
                                        │
                                        └─→ Lemonsqueezy Checkout Page
                                            │
                                            ├─→ [13] User enters card
                                            │
                                            ├─→ [14] User submits
                                            │
                                            ├─→ [15] Process payment
                                            │
                                            ├─→ [16] Payment successful
                                            │
                                            └─→ [17] Trigger webhook
                                                │
                                                └─→ Lemonsqueezy → Your Server
                                                    │
                                                    ├─→ POST /api/lemonsqueezy/webhook
                                                    │   │
                                                    │   ├─→ [18] Verify signature
                                                    │   │
                                                    │   ├─→ [19] Parse payload
                                                    │   │
                                                    │   ├─→ [20] Record payment
                                                    │   │   │
                                                    │   │   └─→ Supabase
                                                    │   │       INSERT payments
                                                    │   │
                                                    │   ├─→ [21] Upgrade user
                                                    │   │   │
                                                    │   │   └─→ Supabase
                                                    │   │       UPDATE users
                                                    │   │       SET is_pro = true
                                                    │   │
                                                    │   └─→ [22] Return 200
                                                    │
                                                    └─→ [23] User directed to
                                                        /payment/success
                                                        │
                                                        └─→ Show success message
                                                            Redirect to profile
```

---

## Database Schema Impact

```
┌────────────────────────────────────────────────┐
│         Supabase Database Changes              │
├────────────────────────────────────────────────┤
│                                                │
│  users table                                   │
│  ├── id (UUID)                                 │
│  ├── email (string)                            │
│  ├── is_pro (boolean) ← UPDATED BY WEBHOOK     │
│  ├── created_at (timestamp)                    │
│  └── updated_at (timestamp)                    │
│                                                │
│  payments table (NEW RECORDS ONLY)             │
│  ├── id (UUID)                                 │
│  ├── user_id (UUID) ← Foreign key to users     │
│  ├── email (string)                            │
│  ├── amount (decimal) → $5.00                  │
│  ├── currency (string) → "USD"                 │
│  ├── payment_method (string) → "lemonsqueezy"  │
│  ├── transaction_id (string) ← Lemonsqueezy ID │
│  ├── status (string) → "completed"             │
│  ├── metadata (JSONB) ← Full webhook data      │
│  ├── created_at (timestamp)                    │
│  └── updated_at (timestamp)                    │
│                                                │
│  Indices (For Performance)                     │
│  ├── transaction_id (UNIQUE) ← Prevent dupes   │
│  ├── user_id                                   │
│  ├── email                                     │
│  └── status                                    │
│                                                │
└────────────────────────────────────────────────┘
```

---

## Security Layer Diagram

```
┌─────────────────────────────────────────────────────┐
│           SECURITY VERIFICATION LAYERS              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [1] WEBHOOK SIGNATURE VERIFICATION                 │
│      ┌──────────────────────────────────────────┐   │
│      │ Incoming Webhook Request                 │   │
│      │                                          │   │
│      │ Headers:                                 │   │
│      │ x-signature: <HMAC-SHA256 hash>         │   │
│      │                                          │   │
│      │ Body: { JSON webhook payload }          │   │
│      └─────────┬────────────────────────────────┘   │
│                │                                     │
│                ▼                                     │
│      ┌──────────────────────────────────────────┐   │
│      │ Handler: verifyWebhookSignature()        │   │
│      │                                          │   │
│      │ 1. Extract signature from header         │   │
│      │ 2. Get webhook secret from .env.local    │   │
│      │ 3. Create HMAC-SHA256(body, secret)      │   │
│      │ 4. timingSafeEqual() comparison          │   │
│      │                                          │   │
│      │ Result: VALID ✅ or INVALID ❌            │   │
│      └─────────┬────────────────────────────────┘   │
│                │                                     │
│        ┌───────┴────────┐                           │
│        │                │                           │
│     VALID            INVALID                        │
│        │                │                           │
│        ▼                ▼                           │
│    Continue      Return 401 Unauthorized           │
│                                                     │
│  [2] DUPLICATE PREVENTION                           │
│      ┌──────────────────────────────────────────┐   │
│      │ Check: Does transaction_id exist?        │   │
│      │                                          │   │
│      │ SELECT * FROM payments                   │   │
│      │ WHERE transaction_id = ?                 │   │
│      │                                          │   │
│      │ Result: FOUND or NOT FOUND               │   │
│      └─────────┬────────────────────────────────┘   │
│                │                                     │
│        ┌───────┴────────┐                           │
│        │                │                           │
│    FOUND (exists)   NOT FOUND (new)                 │
│        │                │                           │
│        ▼                ▼                           │
│    Log warning     Proceed with                     │
│    Return success  payment recording                │
│    (idempotent)                                     │
│                                                     │
│  [3] USER OWNERSHIP VALIDATION                      │
│      ┌──────────────────────────────────────────┐   │
│      │ Check: Does user exist in database?      │   │
│      │                                          │   │
│      │ SELECT id FROM users                     │   │
│      │ WHERE id = ? AND email = ?               │   │
│      │                                          │   │
│      │ Result: EXISTS or NOT EXISTS             │   │
│      └─────────┬────────────────────────────────┘   │
│                │                                     │
│        ┌───────┴────────┐                           │
│        │                │                           │
│      EXISTS          NOT EXISTS                     │
│        │                │                           │
│        ▼                ▼                           │
│    Proceed       Return error                       │
│    with upgrade  (suspicious activity)              │
│                                                     │
│  [4] DATABASE TRANSACTION SAFETY                    │
│      ┌──────────────────────────────────────────┐   │
│      │ All changes wrapped in try-catch          │   │
│      │                                          │   │
│      │ 1. BEGIN TRANSACTION                     │   │
│      │ 2. INSERT into payments table            │   │
│      │ 3. UPDATE users.is_pro = true            │   │
│      │ 4. COMMIT or ROLLBACK                    │   │
│      │                                          │   │
│      │ Ensures: All-or-nothing                  │   │
│      │ No partial state changes                 │   │
│      └──────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Environment Setup Diagram

```
┌────────────────────────────────────────────────────────┐
│            ENVIRONMENT VARIABLE FLOW                   │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Development Local                                     │
│  ────────────────────                                  │
│  ├── .env.local (private, not in git)                 │
│  │   ├── LEMONSQUEEZY_API_KEY                         │
│  │   ├── LEMONSQUEEZY_STORE_ID                        │
│  │   ├── NEXT_PUBLIC_APP_URL = http://localhost:3000  │
│  │   └── (webhook secret optional for local)          │
│  │                                                    │
│  └── → Next.js dev server reads on startup            │
│                                                        │
│  Production (Vercel)                                  │
│  ────────────────────                                 │
│  ├── Vercel Dashboard                                 │
│  │   Settings → Environment Variables                 │
│  │   ├── LEMONSQUEEZY_API_KEY                         │
│  │   ├── LEMONSQUEEZY_STORE_ID                        │
│  │   ├── LEMONSQUEEZY_WEBHOOK_SECRET                  │
│  │   ├── NEXT_PUBLIC_APP_URL = https://yourdomain.com │
│  │   └── All other vars from .env.local               │
│  │                                                    │
│  └── → Vercel injects during build/runtime            │
│                                                        │
│  Lemonsqueezy Config                                  │
│  ──────────────────────                               │
│  ├── Store ID (from Lemonsqueezy Settings)            │
│  ├── API Key (from API Keys section)                  │
│  ├── Webhook Secret (from Webhooks section)           │
│  └── Webhook URL → {NEXT_PUBLIC_APP_URL}/api/...     │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## Request/Response Cycle

```
CLIENT REQUEST                  BACKEND PROCESSING              EXTERNAL API
─────────────────────────────────────────────────────────────────────────────

[1] User clicks button
    │
    └─→ POST /api/lemonsqueezy/checkout
        Content-Type: application/json
        
        {
          "email": "user@example.com",
          "name": "User Name",
          "userId": "uuid-xxx"
        }
            │
            └─→ [2] Validate input
                ├─→ Check email
                ├─→ Check env vars
                └─→ Log request
                    │
                    ├─→ [3] Request products from Lemonsqueezy
                    │   GET /v1/stores/{storeId}/products
                    │   
                    │   Headers:
                    │   Authorization: Bearer {API_KEY}
                    │   Accept: application/vnd.api+json
                    │       │
                    │       └─→ [4] Lemonsqueezy returns
                    │           {
                    │             "data": [
                    │               {
                    │                 "id": "prod_123",
                    │                 "attributes": {
                    │                   "name": "VibeCode Pro"
                    │                 },
                    │                 "relationships": {
                    │                   "variants": {
                    │                     "data": [{
                    │                       "id": "var_456"
                    │                     }]
                    │                   }
                    │                 }
                    │               }
                    │             ]
                    │           }
                    │
                    ├─→ [5] Extract variant ID
                    │   var_456
                    │
                    ├─→ [6] Create checkout session
                    │   POST /v1/checkouts
                    │   
                    │   {
                    │     "data": {
                    │       "type": "checkouts",
                    │       "attributes": {
                    │         "email": "user@example.com",
                    │         "product_options": {
                    │           "name": "User Name"
                    │         },
                    │         "checkout_data": {
                    │           "custom": {
                    │             "userId": "uuid-xxx"
                    │           }
                    │         }
                    │       },
                    │       "relationships": {
                    │         "variant": {
                    │           "data": {
                    │             "type": "variants",
                    │             "id": "var_456"
                    │           }
                    │         }
                    │       }
                    │     }
                    │   }
                    │       │
                    │       └─→ [7] Lemonsqueezy creates
                    │           {
                    │             "data": {
                    │               "id": "chk_789",
                    │               "attributes": {
                    │                 "url": "https://checkout..."
                    │               }
                    │             }
                    │           }
                    │
                    └─→ [8] Extract checkout URL
                        https://checkout.lemonsqueezy.com/abc123
                        │
                        └─→ RESPONSE
                            {
                              "success": true,
                              "checkoutUrl": "https://..."
                            }
                            
RESPONSE STATUS: 200 OK
                    │
                    └─→ [9] JavaScript receives response
                        └─→ window.location.href = checkoutUrl
                            └─→ [10] Redirect to Lemonsqueezy
```

---

## Webhook Lifecycle

```
LEMONSQUEEZY                YOUR SERVER
──────────────────────────────────────────────

[1] Payment completed
    ├─→ Generate webhook
    │   ├─→ Create payload (order data)
    │   ├─→ Sign with webhook secret
    │   └─→ Generate header: x-signature
    │
    └─→ [2] Send webhook
        POST https://yourdomain.com/api/lemonsqueezy/webhook
        
        Headers:
        x-signature: <HMAC-SHA256>
        Content-Type: application/json
        
        Body: { full order data }
                    │
                    └─→ [3] Server receives webhook
                        ├─→ Parse request
                        └─→ Extract signature & body
                            │
                            ├─→ [4] Verify signature
                            │   ├─→ Get webhook secret from .env
                            │   ├─→ Calculate HMAC-SHA256
                            │   ├─→ Compare with received signature
                            │   └─→ Result: VALID ✅
                            │
                            ├─→ [5] Parse webhook payload
                            │   ├─→ Extract order ID
                            │   ├─→ Extract customer email
                            │   ├─→ Extract custom data (userId)
                            │   └─→ Extract amount
                            │
                            ├─→ [6] Check for duplicate
                            │   ├─→ Query: SELECT * FROM payments
                            │   │           WHERE transaction_id = ?
                            │   └─→ Result: Not found (new payment)
                            │
                            ├─→ [7] Record payment
                            │   └─→ INSERT into payments table
                            │       ├─→ user_id
                            │       ├─→ email
                            │       ├─→ amount: $5.00
                            │       ├─→ currency: USD
                            │       ├─→ payment_method: lemonsqueezy
                            │       ├─→ transaction_id
                            │       ├─→ status: completed
                            │       └─→ metadata: full webhook
                            │
                            ├─→ [8] Upgrade user
                            │   └─→ UPDATE users table
                            │       SET is_pro = true
                            │       WHERE id = ?
                            │
                            ├─→ [9] Send confirmation
                            │   └─→ Resend email (optional)
                            │
                            └─→ [10] Return response
                                {
                                  "success": true,
                                  "upgraded": true
                                }
                                
                                Status: 200 OK

                                        │
                                        └─→ Lemonsqueezy marks webhook
                                            as successfully delivered
```

---

This completes the architecture documentation. All diagrams show the complete flow from user interaction through payment to database updates.
