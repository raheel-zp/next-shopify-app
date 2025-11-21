// pages/api/dashboard.js
import axios from "axios";

// Assume ACTIVE_SHOP_TOKENS is imported or available via a database/cache layer

export default async function handler(req, res) {
  const { shop } = req.query;
  // Look up token in your storage solution
  const accessToken = "your_actual_token_from_db"; // Placeholder

  if (!accessToken) {
    // In a Next.js app, you'd handle this by redirecting client-side to an auth page
    return res.status(401).json({ error: "Unauthorized or token missing" });
  }

  // Fetch products logic...
  const productsQuery = `{ products(first: 5) { edges { node { id title } } } }`;
  const productsResp = await axios.post(
    `https://${shop}/admin/api/2023-10/graphql.json`,
    { query: productsQuery },
    { headers: { "X-Shopify-Access-Token": accessToken } }
  );
  const products = productsResp.data.data.products.edges.map((e) => e.node);

  res.status(200).json({ products });
}
