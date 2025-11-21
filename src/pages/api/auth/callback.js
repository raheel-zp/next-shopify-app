// pages/api/auth/callback.js
import axios from "axios";

// In-memory store (Still needs DB for production)
let ACTIVE_SHOP_TOKENS = {};

export default async function handler(req, res) {
  const { shop, code } = req.query;
  if (!shop || !code) {
    return res.status(400).send("Missing parameters");
  }

  const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET } = process.env;

  try {
    const tokenUrl = `https://${shop}/admin/oauth/access_token`;
    const { data } = await axios.post(tokenUrl, {
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code,
    });

    // In a real app, save this token to a secure database
    ACTIVE_SHOP_TOKENS[shop] = data.access_token;

    // Redirect to a frontend page (e.g., /dashboard page in Next.js)
    res.redirect(`/dashboard?shop=${shop}`);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Error exchanging token");
  }
}
