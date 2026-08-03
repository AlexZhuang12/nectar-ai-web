export function getLemonSqueezyApiKey(): string {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("LEMONSQUEEZY_API_KEY is not configured");
  }
  return apiKey;
}

export function getLemonSqueezyStoreId(): string {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID?.trim();
  if (!storeId) {
    throw new Error("LEMONSQUEEZY_STORE_ID is not configured");
  }
  return storeId;
}

export function getLemonSqueezyVariantId(): string {
  const variantId = process.env.LEMONSQUEEZY_VARIANT_ID?.trim();
  if (!variantId) {
    throw new Error("LEMONSQUEEZY_VARIANT_ID is not configured");
  }
  return variantId;
}

interface LemonSqueezyCheckoutResponse {
  data?: {
    attributes?: {
      url?: string;
    };
  };
}

export async function createLemonSqueezyCheckout(params: {
  userId: string;
  email?: string;
  redirectUrl: string;
}): Promise<string> {
  const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${getLemonSqueezyApiKey()}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          product_options: {
            redirect_url: params.redirectUrl,
          },
          checkout_data: {
            email: params.email,
            custom: {
              user_id: params.userId,
            },
          },
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: getLemonSqueezyStoreId(),
            },
          },
          variant: {
            data: {
              type: "variants",
              id: getLemonSqueezyVariantId(),
            },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Lemon Squeezy checkout failed: ${errorText}`);
  }

  const payload = (await response.json()) as LemonSqueezyCheckoutResponse;
  const url = payload.data?.attributes?.url;

  if (!url) {
    throw new Error("Lemon Squeezy checkout URL missing from response");
  }

  return url;
}
