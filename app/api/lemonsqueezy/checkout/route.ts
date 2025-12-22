import { NextRequest, NextResponse } from 'next/server';

const LEMON_SQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY;
const LEMON_SQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;
const LEMON_SQUEEZY_VARIANT_ID_MONTHLY = process.env.LEMONSQUEEZY_VARIANT_ID_MONTHLY;
const LEMON_SQUEEZY_VARIANT_ID_ANNUAL = process.env.LEMONSQUEEZY_VARIANT_ID_ANNUAL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

type PricingTier = 'monthly' | 'annual';

// Cache products list for 1 hour to reduce API calls
let productCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

async function getVariantId(pricingTier: PricingTier = 'monthly'): Promise<string | null> {
  // If variant IDs are hardcoded in env, use them
  if (pricingTier === 'annual' && LEMON_SQUEEZY_VARIANT_ID_ANNUAL) {
    return LEMON_SQUEEZY_VARIANT_ID_ANNUAL;
  }
  if (pricingTier === 'monthly' && LEMON_SQUEEZY_VARIANT_ID_MONTHLY) {
    return LEMON_SQUEEZY_VARIANT_ID_MONTHLY;
  }

  // Check cache first
  if (productCache && Date.now() - productCache.timestamp < CACHE_DURATION) {
    return pricingTier === 'annual'
      ? productCache.data.variantIdAnnual
      : productCache.data.variantIdMonthly;
  }

  try {
    const variantResponse = await fetch(
      `https://api.lemonsqueezy.com/v1/stores/${LEMON_SQUEEZY_STORE_ID}/products`,
      {
        headers: {
          Authorization: `Bearer ${LEMON_SQUEEZY_API_KEY}`,
          Accept: 'application/vnd.api+json',
        },
      }
    );

    if (!variantResponse.ok) {
      throw new Error('Failed to fetch products from Lemonsqueezy');
    }

    const productsData = await variantResponse.json();
    let variantIdMonthly: string | null = null;
    let variantIdAnnual: string | null = null;

    if (productsData.data && Array.isArray(productsData.data)) {
      const proProduct = productsData.data.find(
        (product: any) =>
          product.attributes?.name?.includes('Pro') ||
          product.attributes?.name?.includes('VibeCode')
      );

      if (proProduct?.relationships?.variants?.data) {
        const variants = proProduct.relationships.variants.data;
        
        // Find monthly variant ($5)
        const monthlyVariant = variants.find((v: any) => {
          const variantId = v.id;
          // You might need to fetch variant details to get pricing
          // For now, assume first is monthly, second is annual
          return true;
        });
        
        if (monthlyVariant?.id) {
          variantIdMonthly = monthlyVariant.id;
        }
        
        // Find annual variant ($50) - typically second in list
        if (variants[1]?.id) {
          variantIdAnnual = variants[1].id;
        } else if (variants[0]?.id && !variantIdMonthly) {
          variantIdMonthly = variants[0].id;
        }
      }
    }

    // Cache the result
    productCache = {
      data: { variantIdMonthly, variantIdAnnual },
      timestamp: Date.now(),
    };
    
    return pricingTier === 'annual' ? variantIdAnnual : variantIdMonthly;
  } catch (error) {
    console.error('Error fetching variant ID:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const body = await request.json();
    const { email, name, userId, pricingTier = 'monthly' } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!LEMON_SQUEEZY_API_KEY || !LEMON_SQUEEZY_STORE_ID) {
      console.error('Missing Lemonsqueezy credentials');
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      );
    }

    // Get variant ID based on pricing tier
    const variantId = await getVariantId(pricingTier as PricingTier);
    const hasHardcodedVariants =
      (pricingTier === 'annual' && LEMON_SQUEEZY_VARIANT_ID_ANNUAL) ||
      (pricingTier === 'monthly' && LEMON_SQUEEZY_VARIANT_ID_MONTHLY);

    if (!variantId && !hasHardcodedVariants) {
      console.error(`Could not find VibeCode Pro ${pricingTier} variant`);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 500 }
      );
    }

    // Create checkout session
    const checkoutPayload = {
      data: {
        type: 'checkouts',
        attributes: {
          email,
          product_options: {
            name: name || email.split('@')[0],
            redirect_url: `${APP_URL}/payment/success`,
          },
          checkout_data: {
            custom: {
              userId,
              platform: 'vibecode-mentor',
              plan: 'pro',
              pricingTier,
            },
          },
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: LEMON_SQUEEZY_STORE_ID,
            },
          },
          ...(variantId && {
            variant: {
              data: {
                type: 'variants',
                id: variantId,
              },
            },
          }),
        },
      },
    };

    const createCheckoutResponse = await fetch(
      'https://api.lemonsqueezy.com/v1/checkouts',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${LEMON_SQUEEZY_API_KEY}`,
          'Content-Type': 'application/vnd.api+json',
          Accept: 'application/vnd.api+json',
        },
        body: JSON.stringify(checkoutPayload),
      }
    );

    if (!createCheckoutResponse.ok) {
      const errorData = await createCheckoutResponse.json();
      console.error('Lemonsqueezy API error:', errorData);
      throw new Error('Failed to create checkout session');
    }

    const checkoutData = await createCheckoutResponse.json();
    const checkoutUrl = checkoutData.data?.attributes?.url;

    if (!checkoutUrl) {
      throw new Error('No checkout URL in response');
    }

    return NextResponse.json(
      {
        success: true,
        checkoutUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create checkout',
      },
      { status: 500 }
    );
  }
}
