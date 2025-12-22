# VibeCode Mentor Pro - Dual Pricing Variants Setup

## Overview

This guide explains the dual pricing variant setup for VibeCode Mentor Pro:
- **Monthly**: $5/month (billed monthly, cancel anytime)
- **Annual**: $50/year ($4.17/month, 17% savings)

---

## Implementation Summary

### Features Implemented

✅ **Pricing Selection UI**
- Users choose between Monthly and Annual plans in the upgrade modal
- Annual plan shows "SAVE 17%" badge
- Pricing clearly displayed with billing terms

✅ **Dynamic Checkout**
- Correct variant ID used based on selected plan
- Plan details passed to Lemonsqueezy API
- Success page displays selected plan

✅ **Success Page**
- Shows purchased plan ($5/month or $50/year)
- Displays billing frequency
- Professional confirmation with plan details

✅ **Webhook Support**
- Payment method and pricing tier recorded in database
- User tagged as Pro regardless of plan choice
- Plan details available for future references (cancellations, upgrades, etc.)

---

## Environment Variables Setup

Update your `.env.local` with **separate variant IDs** for each plan:

```env
# Lemonsqueezy Configuration
LEMONSQUEEZY_API_KEY=your_api_key
LEMONSQUEEZY_STORE_ID=your_store_id

# Variant IDs - Get these from your Lemonsqueezy dashboard
LEMONSQUEEZY_VARIANT_ID_MONTHLY=12345    # Your monthly variant ID ($5)
LEMONSQUEEZY_VARIANT_ID_ANNUAL=67890     # Your annual variant ID ($50)

LEMONSQUEEZY_WEBHOOK_SECRET=whsec_abc123def456
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## How to Get Variant IDs

### 1. Log into Lemonsqueezy Dashboard

Go to [lemonsqueezy.com](https://lemonsqueezy.com) and sign in

### 2. Navigate to Your Product

**Products** → **VibeCode Mentor Pro**

### 3. Find Both Variants

You should see two variants listed:

```
Variant 1: Monthly Subscription
├─ Price: $5.00
├─ Interval: Monthly
└─ ID: 12345  ← Copy this to LEMONSQUEEZY_VARIANT_ID_MONTHLY

Variant 2: Annual Subscription
├─ Price: $50.00
├─ Interval: Yearly
└─ ID: 67890  ← Copy this to LEMONSQUEEZY_VARIANT_ID_ANNUAL
```

### 4. Copy IDs to Environment

```env
LEMONSQUEEZY_VARIANT_ID_MONTHLY=12345
LEMONSQUEEZY_VARIANT_ID_ANNUAL=67890
```

---

## How It Works

### User Flow

1. **Upgrade Modal**
   ```
   User clicks "Upgrade"
         ↓
   Sees two pricing options:
   - Monthly ($5/month)
   - Annual ($50/year) ← SAVE 17%
         ↓
   Selects preferred plan
         ↓
   Clicks "Checkout - $5/month" or "Checkout - $50/year"
   ```

2. **Checkout**
   ```
   LemonsqueezyButton receives pricingTier
         ↓
   Sends to /api/lemonsqueezy/checkout
         ↓
   API selects correct variant ID based on tier
         ↓
   Creates Lemonsqueezy checkout session
         ↓
   Redirects to Lemonsqueezy payment page
   ```

3. **Payment**
   ```
   User completes payment on Lemonsqueezy
         ↓
   Lemonsqueezy sends order_completed webhook
         ↓
   Webhook records payment with pricingTier
         ↓
   User upgraded to Pro (same for both plans)
   ```

4. **Success**
   ```
   Redirected to /payment/success
         ↓
   Page displays:
   - "Welcome to VibeCode Mentor Pro! 🎉"
   - "$5/month" or "$50/year" (based on selection)
   - Billing terms
         ↓
   Auto-redirects to home page after 5 seconds
   ```

---

## Pricing Tier Tracking

### In Database

When a payment is recorded, the webhook stores:

```json
{
  "userId": "user-123",
  "pricingTier": "monthly" | "annual",
  "amount": 5.00 | 50.00,
  "currency": "USD",
  "paymentMethod": "lemonsqueezy",
  "status": "completed"
}
```

### Future Use Cases

This data enables:
- ✅ Upgrade/downgrade flows
- ✅ Cancellation analytics
- ✅ Revenue reporting by plan
- ✅ Personalized retention offers
- ✅ Plan-specific feature toggles

---

## Testing Locally

### 1. Start Dev Server

```bash
npm run dev
```

### 2. Navigate to Upgrade Modal

Go to: `http://localhost:3000/profile` → Click "Upgrade"

### 3. Test Both Plans

**Test Monthly ($5):**
1. Select "Monthly"
2. Click "Checkout - $5/month"
3. Use test card: `4111 1111 1111 1111`
4. Verify success page shows "$5/month"

**Test Annual ($50):**
1. Go back and click "Upgrade" again
2. Select "Annual"
3. Click "Checkout - $50/year"
4. Use test card: `4111 1111 1111 1111`
5. Verify success page shows "$50/year"

### 4. Check Webhook

Lemonsqueezy Dashboard → Webhooks → Click webhook
- Verify both payments show in delivery logs
- Check custom_data includes `pricingTier`

---

## File Changes

### Modified Files

```
✏️ components/ProUpgradeModal.tsx
   - Added PricingTier state
   - Added pricing selection UI (Monthly/Annual)
   - Pass pricingTier to LemonsqueezyButton

✏️ components/LemonsqueezyButton.tsx
   - Accept pricingTier prop
   - Send pricingTier to checkout API
   - Display correct button text ($5/month or $50/year)
   - Save pricing tier to sessionStorage

✏️ app/api/lemonsqueezy/checkout/route.ts
   - Accept pricingTier from request
   - Use separate variant IDs for each tier
   - Implement variant caching by tier
   - Pass pricingTier to checkout payload

✏️ app/payment/success/page.tsx
   - Retrieve pricingTier from sessionStorage
   - Display plan details with pricing
   - Show billing terms for each plan
```

### New Environment Variables

```
LEMONSQUEEZY_VARIANT_ID_MONTHLY
LEMONSQUEEZY_VARIANT_ID_ANNUAL
```

---

## Troubleshooting

### "Checkout - $5/month" button doesn't change to "$50/year"

**Check:**
1. Annual radio button is selected
2. Component re-renders properly
3. Browser cache cleared

**Fix:**
```bash
rm -rf .next
npm run dev
```

### Annual variant not found

**Check:**
1. `LEMONSQUEEZY_VARIANT_ID_ANNUAL` is in `.env.local`
2. Variant ID matches Lemonsqueezy exactly (no spaces)
3. Annual variant exists in your Lemonsqueezy store

**Debug:**
Look at server logs during checkout to see which variant ID is being used.

### Success page shows wrong pricing

**Check:**
1. sessionStorage.setItem is working (`checkout-pricing-tier`)
2. Success page retrieves from sessionStorage correctly
3. Pricing tier is passed to checkout API

### Webhook shows same pricing for both tiers

**Check:**
1. pricingTier is included in checkout_data.custom
2. API receives pricingTier correctly
3. Database schema supports storing pricingTier

---

## Production Deployment

### 1. Update Environment Variables

**Vercel:**
1. Go to Settings → Environment Variables
2. Add both variant IDs:
   ```
   LEMONSQUEEZY_VARIANT_ID_MONTHLY=12345
   LEMONSQUEEZY_VARIANT_ID_ANNUAL=67890
   ```

### 2. Deploy

```bash
git add .
git commit -m "feat: implement dual pricing variants (monthly/annual)"
git push origin main
```

### 3. Test on Staging

Before production, test with real payment:
1. Select Monthly plan
2. Complete payment
3. Verify success page
4. Repeat for Annual plan

### 4. Monitor Webhooks

After production deployment, monitor:
1. Lemonsqueezy dashboard for webhook deliveries
2. Database for recorded payments with pricingTier
3. Success pages for correct pricing display

---

## Future Enhancements

💡 **Possible Improvements:**
- [ ] Upgrade from Monthly to Annual
- [ ] Downgrade from Annual to Monthly
- [ ] Pro-rata refunds
- [ ] Pricing history API
- [ ] Admin dashboard showing plan breakdown
- [ ] Email campaigns for annual plan promotion

---

## API Reference

### Checkout Request

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "userId": "user-123",
  "pricingTier": "monthly" | "annual"
}
```

### Checkout Response

```json
{
  "success": true,
  "checkoutUrl": "https://lemonsqueezy.com/checkout/..."
}
```

### Webhook Payload (custom_data)

```json
{
  "userId": "user-123",
  "platform": "vibecode-mentor",
  "plan": "pro",
  "pricingTier": "monthly" | "annual"
}
```

---

## Support

- **Lemonsqueezy Docs**: https://docs.lemonsqueezy.com
- **API Reference**: https://api.lemonsqueezy.com/v1
- **Webhook Guide**: https://docs.lemonsqueezy.com/api/webhooks

---

**Last Updated**: December 2024  
**Status**: ✅ Ready for Production  
**Variants**: Monthly ($5) + Annual ($50)
