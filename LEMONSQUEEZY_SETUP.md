# Lemonsqueezy Integration Setup Guide

This guide explains how to set up Lemonsqueezy as the payment provider for VibeCode Mentor Pro subscriptions.

## 1. Create a Lemonsqueezy Account

1. Go to [lemonsqueezy.com](https://lemonsqueezy.com)
2. Sign up for a free account
3. Complete your profile and business information

## 2. Create a Store

1. In the Lemonsqueezy dashboard, go to **Settings → Stores**
2. Click **Create Store**
3. Enter your store name (e.g., "VibeCode Mentor")
4. Save the Store ID (you'll need this for environment variables)

## 3. Create a Product

1. Go to **Products** in the dashboard
2. Click **Create Product**
3. Set up your Pro subscription:
   - **Name**: VibeCode Mentor Pro
   - **Price**: $5.00
   - **Billing interval**: Monthly (optional, or use one-time for testing)
   - **Description**: Unlimited blueprint generations, AI chat, and more

4. Create a variant if needed:
   - **Name**: Monthly Subscription
   - **Price**: $5.00

5. Save the Product and note the Product ID and Variant ID

## 4. Generate API Key

1. Go to **Settings → API Keys**
2. Click **Create API Key**
3. Select scopes:
   - `products:read`
   - `checkouts:read`
   - `checkouts:write`
   - `orders:read`

4. Save the API key securely

## 5. Set Up Webhook

1. Go to **Settings → Webhooks**
2. Click **Add Webhook**
3. Set the webhook URL to:
   ```
   https://yourdomain.com/api/lemonsqueezy/webhook
   ```
   For local development, use ngrok:
   ```
   https://your-ngrok-id.ngrok.io/api/lemonsqueezy/webhook
   ```

4. Select events to listen to:
   - ✅ `order_completed`
   - ✅ `order_refunded` (optional)
   - ✅ `subscription_updated` (optional)

5. Copy the webhook signature secret (you'll need this)

## 6. Environment Variables

Add these to your `.env.local` file:

```env
# Lemonsqueezy
LEMONSQUEEZY_API_KEY=your_api_key_here
LEMONSQUEEZY_STORE_ID=your_store_id_here
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here

# App URL (for redirect after checkout)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change in production
```

## 7. Test the Integration

### Local Testing with ngrok

1. Install ngrok: `npm install -g ngrok`
2. Start your Next.js dev server: `npm run dev`
3. In another terminal, expose your local server:
   ```bash
   ngrok http 3000
   ```
4. Update `NEXT_PUBLIC_APP_URL` in `.env.local` with your ngrok URL
5. Update the webhook URL in Lemonsqueezy dashboard with your ngrok URL

### Test a Checkout

1. Open http://localhost:3000/profile
2. Click the "Upgrade" button
3. Select "Lemonsqueezy" as payment method
4. Click "Checkout - $5/month"
5. You'll be redirected to the Lemonsqueezy checkout page
6. Use test card numbers (provided by Lemonsqueezy)

### Verify Webhook

After successful payment:
1. Check Lemonsqueezy dashboard → Orders to see the completed order
2. Check your app's database to verify the payment was recorded
3. Verify user was upgraded to Pro status

## 8. Production Deployment

1. Add environment variables to your hosting platform:
   - Vercel: Settings → Environment Variables
   - Other platforms: Follow your provider's documentation

2. Update `NEXT_PUBLIC_APP_URL` to your production domain:
   ```env
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

3. Update webhook URL in Lemonsqueezy to:
   ```
   https://yourdomain.com/api/lemonsqueezy/webhook
   ```

4. Test a real transaction before going live

## Payment Flow

```
User clicks "Upgrade"
    ↓
ProUpgradeModal opens
    ↓
User selects "Lemonsqueezy" payment method
    ↓
User clicks "Checkout - $5/month"
    ↓
LemonsqueezyButton component handles checkout
    ↓
POST /api/lemonsqueezy/checkout
    ↓
Lemonsqueezy API creates checkout session
    ↓
User redirected to Lemonsqueezy checkout page
    ↓
User completes payment with card/bank transfer
    ↓
Lemonsqueezy sends webhook to /api/lemonsqueezy/webhook
    ↓
Payment recorded in database
    ↓
User upgraded to Pro status
    ↓
User redirected to /payment/success
```

## Troubleshooting

### Checkout URL not returned
- Verify API key is correct
- Check store ID matches
- Ensure product exists in store

### Webhook not triggering
- Verify webhook URL is accessible
- Check webhook signature secret matches
- Verify webhook secret in .env.local

### User not upgraded to Pro
- Check database connection (Supabase)
- Verify user ID in webhook payload
- Check Lemonsqueezy logs for order details

### Payment appearing twice
- Webhook handler has duplicate prevention built-in
- Check database for duplicate transaction IDs

## Support

- Lemonsqueezy Documentation: https://docs.lemonsqueezy.com
- API Reference: https://api.lemonsqueezy.com/v1
- Support: https://support.lemonsqueezy.com
