let cachedToken = null;
let tokenExpiry = 0;

async function getStorefrontToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const { SHOPIFY_SHOP, SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET } =
    process.env;

  const res = await fetch(
    `https://${SHOPIFY_SHOP}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: SHOPIFY_CLIENT_ID,
        client_secret: SHOPIFY_CLIENT_SECRET,
      }),
    },
  );

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
  return cachedToken;
}

export default async function handler(req, res) {
  try {
    const token = await getStorefrontToken();

    const productsRes = await fetch(
      `https://${process.env.SHOPIFY_SHOP}/admin/api/2024-01/products.json?vendor=RubenTCG&published_status=published&limit=20`,
      {
        headers: {
          "X-Shopify-Access-Token": token,
        },
      },
    );

    const json = await productsRes.json();
    if (!json.products) return res.status(200).json({ debug: json });
    const products = json.products.map((p) => ({
      title: p.title,
      handle: p.handle,
      image: p.images[0]?.src,
      imageAlt: p.images[0]?.alt || p.title,
      price: parseFloat(p.variants[0]?.price || 0).toFixed(0),
      currency: "NOK",
    }));

    res.status(200).json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
