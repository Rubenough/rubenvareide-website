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

    const query = `{
      products(first: 20, query: "vendor:RubenTCG") {
        edges {
          node {
            title
            handle
            featuredImage { url altText }
            priceRange {
              minVariantPrice { amount currencyCode }
            }
          }
        }
      }
    }`;

    const productsRes = await fetch(
      `https://${process.env.SHOPIFY_SHOP}/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Shopify-Storefront-Private-Token": token,
        },
        body: JSON.stringify({ query }),
      },
    );

    const json = await productsRes.json();
    if (!json.data) return res.status(500).json([]);
    const products = json.data.products.edges.map(({ node }) => ({
      title: node.title,
      handle: node.handle,
      image: node.featuredImage?.url,
      imageAlt: node.featuredImage?.altText || node.title,
      price: parseFloat(node.priceRange.minVariantPrice.amount).toFixed(0),
      currency: node.priceRange.minVariantPrice.currencyCode,
    }));

    res.status(200).json(products);
  } catch (e) {
    res.status(500).json([]);
  }
}
