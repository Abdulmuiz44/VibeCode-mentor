# VibeCode Mentor Pro - Lemonsqueezy Product Setup Guide

## Overview

This guide walks you through creating a **VibeCode Mentor Pro** product in your Lemonsqueezy store and configuring it in your application.

---

## Step-by-Step Product Creation

### 1. Log into Lemonsqueezy Dashboard

1. Go to [lemonsqueezy.com](https://lemonsqueezy.com)
2. Click **Sign In** (top right)
3. Enter your email and password
4. Click the dashboard link once logged in

---

### 2. Verify Your Store ID

1. Go to **Settings → Stores**
2. You'll see your store listed
3. **Copy and save the Store ID** (you'll need this later)
   - Format: numeric ID like `123456`

![Store ID Location](https://docs.lemonsqueezy.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fstores.1b4c8c9f.png&w=1200&q=75)

---

### 3. Create the VibeCode Pro Product

#### 3.1 Navigate to Products

1. In the left sidebar, click **Products**
2. Click the **Create Product** button (usually in top right)

#### 3.2 Basic Product Details

Fill in the following fields:

| Field | Value |
|-------|-------|
| **Product Name** | `VibeCode Mentor Pro` |
| **Description** | `Unlock unlimited blueprint generations, advanced AI chat, custom prompts, and priority support.` |
| **Product Type** | `SaaS/Digital Product` (select from dropdown) |

#### 3.3 Pricing Configuration

**Option A: Monthly Subscription (Recommended)**

1. Scroll to **Pricing** section
2. Click **Add Price**
3. Set the following:
   - **Variant Name**: `Monthly Subscription`
   - **Billing Type**: `Recurring`
   - **Billing Interval**: `Monthly`
   - **Price**: `5.00` USD
   - **Currency**: `USD`

4. **Subscription Settings** (optional):
   - Trial Period: Leave blank (no trial)
   - Max Billing Cycles: Leave blank (unlimited)

**Option B: Annual Subscription**

1. Follow the same steps as above but:
   - **Variant Name**: `Annual Subscription`
   - **Billing Interval**: `Yearly`
   - **Price**: `50.00` USD (equivalent to ~$4.17/month)

#### 3.4 Additional Settings

1. Scroll down to **Product Images** (optional):
   - Add a product image or logo
   - Recommended size: 1200x628px

2. **Product Data** (optional):
   - License Key: Leave blank (not needed for this setup)
   - Require License Activation: No

3. **Webhook Events**:
   - Leave default (we handle this separately)

#### 3.5 Save the Product

1. Click **Save Product** (bottom right)
2. Wait for confirmation

---

### 4. Copy Your Variant ID

After product creation:

1. Go to **Products** → **VibeCode Mentor Pro**
2. Click on the product to view details
3. Find the **Variant** section
4. **Copy the Variant ID** for the pricing tier you created
   - Format: numeric ID like `987654`

**Screenshot location**: The variant ID appears under each pricing option

---

### 5. Generate API Key

#### 5.1 Create API Key

1. Go to **Settings → API Keys**
2. Click **Create API Key** button
3. Give it a name: `VibeCode Mentor Development`
4. Select **Scopes**:
   - ✅ `products:read`
   - ✅ `checkouts:read`
   - ✅ `checkouts:write`
   - ✅ `orders:read`

5. Click **Create**
6. **Copy the API Key** immediately (you won't see it again)
   - Format: `eyJ0eXAiOiJKV1QiLCJhbGc...`

---

### 6. Set Up Webhook

#### 6.1 Create Webhook

1. Go to **Settings → Webhooks**
2. Click **Add Webhook**
3. Fill in:
   - **Endpoint URL**: `https://yourdomain.com/api/lemonsqueezy/webhook`
   - **Events**: Select
     - ✅ `order_completed`
     - ✅ `subscription_updated` (optional)
     - ✅ `order_refunded` (optional)

4. Click **Create**

#### 6.2 Copy Webhook Secret

1. After creation, you'll see your webhook listed
2. Click the webhook to view details
3. **Copy the Webhook Secret**
   - Format: `whsec_...`

**Local Development Note**: For ngrok testing, update the webhook URL later when you have your ngrok address.

---

## Environment Variables Configuration

### Update Your `.env.local`

Create or update the file at the project root:

```bash
# Copy the example first
cp .env.local.example .env.local
```

Then add/update these variables:

```env
# Lemonsqueezy Configuration
LEMONSQUEEZY_API_KEY=your_api_key_here
LEMONSQUEEZY_STORE_ID=your_store_id_here
LEMONSQUEEZY_VARIANT_ID=your_variant_id_here
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Example with Real Values

```env
LEMONSQUEEZY_API_KEY=eyJ0eXAiOiJKV1QiLCJhbGc...
LEMONSQUEEZY_STORE_ID=123456
LEMONSQUEEZY_VARIANT_ID=987654
LEMONSQUEEZY_WEBHOOK_SECRET=whsec_abc123def456
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Optimization Benefits

The updated payment flow now includes:

✅ **Request Deduplication**: Prevents double-clicks from creating multiple checkout sessions
✅ **Caching**: Variant ID cached for 1 hour (reduces API calls)
✅ **Better Error Handling**: More detailed error messages
✅ **Session Recovery**: Checkout data stored in sessionStorage for recovery
✅ **Improved UX**: Animated spinner during redirect
✅ **Input Validation**: Stronger type checking

---

## Testing Locally

### 1. Start Your Dev Server

```bash
npm install
npm run dev
```

### 2. Test with Lemonsqueezy Test Card

- Navigate to: `http://localhost:3000/profile`
- Click **Upgrade** button
- Select **Lemonsqueezy**
- Click **Checkout - $5/month**
- You'll be redirected to Lemonsqueezy checkout

#### Test Card Details

```
Card Number: 4111 1111 1111 1111
Expiry: 12/25
CVC: 123
Cardholder Name: Test User
Billing Address: Any valid address
```

### 3. Verify Webhook (Local Testing)

For local webhook testing, use **ngrok**:

```bash
# Install ngrok
npm install -g ngrok

# In another terminal, expose your app
ngrok http 3000
```

Then:

1. Go to **Lemonsqueezy Settings → Webhooks**
2. Edit your webhook
3. Update URL to: `https://your-ngrok-id.ngrok.io/api/lemonsqueezy/webhook`
4. Save

Now test payments locally and watch for webhook delivery in Lemonsqueezy dashboard.

---

## Production Deployment

### 1. Update Environment Variables

In your hosting platform (Vercel, etc.):

1. Go to **Settings → Environment Variables**
2. Add all `LEMONSQUEEZY_*` variables
3. Update `NEXT_PUBLIC_APP_URL` to your production domain:
   ```env
   NEXT_PUBLIC_APP_URL=https://vibecode-mentor.com
   ```

### 2. Update Webhook URL

1. Go to **Lemonsqueezy Settings → Webhooks**
2. Edit your webhook
3. Change URL to: `https://vibecode-mentor.com/api/lemonsqueezy/webhook`
4. Save and test

### 3. Deploy

```bash
git add .
git commit -m "feat: optimize lemonsqueezy payment flow"
git push origin main
```

Vercel (or your platform) will auto-deploy.

### 4. Test Real Transaction

1. Navigate to your production site
2. Click **Upgrade**
3. Use a real test card (check Lemonsqueezy docs for test cards specific to your region)
4. Verify:
   - Payment appears in Lemonsqueezy dashboard
   - User is upgraded to Pro
   - Webhook logs show successful delivery

---

## Verification Checklist

### Product Setup
- [ ] Store ID saved
- [ ] VibeCode Mentor Pro product created
- [ ] Variant created ($5/month)
- [ ] Variant ID copied
- [ ] Product is **Published** (check status)

### Configuration
- [ ] API Key generated and saved
- [ ] Webhook created and configured
- [ ] Webhook Secret copied
- [ ] All credentials in `.env.local`
- [ ] `NEXT_PUBLIC_APP_URL` matches your domain

### Testing
- [ ] Dev server starts: `npm run dev`
- [ ] Can reach upgrade modal: `/profile` → "Upgrade"
- [ ] Lemonsqueezy selected by default
- [ ] Test checkout completes without errors
- [ ] Webhook received (check Lemonsqueezy logs)
- [ ] User upgraded to Pro status

### Production
- [ ] Environment variables in hosting platform
- [ ] Domain URL correct in `NEXT_PUBLIC_APP_URL`
- [ ] Webhook URL updated to production
- [ ] Real test transaction successful
- [ ] Payment recorded in database
- [ ] User Pro status confirmed

---

## Troubleshooting

### "No checkout URL returned"

**Check:**
1. API Key is correct (copy-paste from Lemonsqueezy)
2. Store ID matches Lemonsqueezy dashboard
3. Product is **Published** (not draft)
4. Variant exists and is accessible

**Fix:**
```bash
# Clear cache and restart
rm -rf .next
npm run dev
```

### "Variant not found"

**Check:**
1. Variant ID is in `.env.local`
2. Variant ID matches Lemonsqueezy exactly
3. No spaces or extra characters

**Fallback:**
If you removed the variant ID from env, the API will auto-discover it (slower but works).

### "Webhook not triggering"

**Check:**
1. Webhook URL is accessible from internet
2. For local: ngrok URL is correct in Lemonsqueezy
3. Webhook Secret matches `.env.local` exactly
4. No extra spaces/newlines

**Debug:**
Check Lemonsqueezy dashboard → Webhooks → Click webhook → View attempts
Look for delivery logs and error messages.

### "User not upgraded after payment"

**Check:**
1. Database connection working (Supabase)
2. User ID being passed to checkout
3. Webhook signature verification passing
4. Check server logs for webhook errors

---

## File Changes Summary

### Modified Files
- `components/LemonsqueezyButton.tsx` - Enhanced with request deduplication and better UX
- `app/api/lemonsqueezy/checkout/route.ts` - Added caching and optimization

### New Environment Variables
- `LEMONSQUEEZY_VARIANT_ID` - Direct variant reference (optional but recommended)

---

## Next Steps

1. ✅ Create product in Lemonsqueezy (this guide)
2. ✅ Get credentials (API Key, Store ID, Variant ID, Webhook Secret)
3. ✅ Update `.env.local`
4. ✅ Test locally
5. ✅ Deploy to production
6. ✅ Monitor webhook deliveries

---

## Support

- **Lemonsqueezy Docs**: https://docs.lemonsqueezy.com
- **API Reference**: https://api.lemonsqueezy.com/v1
- **Webhook Guide**: https://docs.lemonsqueezy.com/api/webhooks
- **Test Cards**: https://docs.lemonsqueezy.com/guides/testing

---

**Last Updated**: December 2024  
**Status**: ✅ Ready for Production
