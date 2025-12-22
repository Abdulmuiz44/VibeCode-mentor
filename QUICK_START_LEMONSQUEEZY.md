# Quick Start: Lemonsqueezy Setup (5 minutes)

## For Developers

### 1. Install Dependencies
```bash
npm install
# Already removed PayPal dependency from package.json
```

### 2. Configure Environment
```bash
cp .env.local.example .env.local
```

Add these three lines:
```env
LEMONSQUEEZY_API_KEY=sk_live_xxxxx
LEMONSQUEEZY_STORE_ID=12345
LEMONSQUEEZY_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Test Locally
```bash
npm run dev
```

Visit: http://localhost:3000/profile → Click "Upgrade"

---

## For Users / Getting Credentials

### Step 1: Sign Up (2 min)
1. Go to https://lemonsqueezy.com
2. Create account
3. Verify email

### Step 2: Create Store (1 min)
1. Dashboard → Settings → Stores
2. Click "Create Store"
3. **Copy Store ID** → Save it

### Step 3: Create Product (1 min)
1. Products → New Product
2. Name: `VibeCode Mentor Pro`
3. Price: `$5.00`
4. Billing: `Monthly` (optional)
5. Save

### Step 4: Generate API Key (1 min)
1. Settings → API Keys
2. Create Key with scopes:
   - `products:read`
   - `checkouts:read`
   - `checkouts:write`
   - `orders:read`
3. **Copy API Key** → Save it

### Step 5: Setup Webhook (Optional, for production)
1. Settings → Webhooks
2. Add webhook URL:
   ```
   https://yourdomain.com/api/lemonsqueezy/webhook
   ```
3. Select `order_completed` event
4. **Copy Webhook Secret** → Save it

---

## Credentials Checklist

```
☐ Store ID: ___________________
☐ API Key: ____________________
☐ Webhook Secret: _____________
☐ NEXT_PUBLIC_APP_URL: http://localhost:3000
```

---

## Test a Payment

```bash
npm run dev
```

1. Open http://localhost:3000/profile
2. Click "Upgrade"
3. Select "Lemonsqueezy" (default)
4. Click "Checkout - $5/month"
5. **Pay with test card**: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
6. Complete checkout

✅ You should be redirected to `/payment/success`

---

## Files Changed

### New
- `app/api/lemonsqueezy/checkout/route.ts` - Checkout handler
- `app/api/lemonsqueezy/webhook/route.ts` - Webhook receiver
- `components/LemonsqueezyButton.tsx` - Payment button
- `LEMONSQUEEZY_SETUP.md` - Full setup guide
- `.env.local.example` - Environment template

### Modified
- `components/ProUpgradeModal.tsx` - Replaced PayPal with Lemonsqueezy
- `package.json` - Removed @paypal/react-paypal-js

### Old (Can Delete Later)
- `components/PayPalButton.tsx`
- `app/api/paypal/**`
- `app/api/webhooks/paypal/route.ts`

---

## Troubleshooting

### "PayPal Client ID missing" error
**Fix**: You're still running old code. Delete cache:
```bash
rm -rf .next
npm run dev
```

### Checkout returns no URL
**Fix**: Check API Key and Store ID in `.env.local` are correct

### Webhook not triggering
**Fix**: Only happens in production. For local dev, manually test the endpoint:
```bash
curl -X POST http://localhost:3000/api/lemonsqueezy/webhook \
  -H "Content-Type: application/json" \
  -H "x-signature: test" \
  -d '{"data":{"id":"test"}}'
```

### User not upgraded to Pro
**Fix**: Check Supabase connection and `NEXT_PUBLIC_SUPABASE_*` variables

---

## Support

- **Setup Help**: See `LEMONSQUEEZY_SETUP.md`
- **Migration Details**: See `MIGRATION_PAYPAL_TO_LEMONSQUEEZY.md`
- **Lemonsqueezy Docs**: https://docs.lemonsqueezy.com

---

That's it! You're ready to go. 🚀
