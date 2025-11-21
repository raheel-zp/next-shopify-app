// pages/api/dashboard.js
import axios from "axios";

// Assume ACTIVE_SHOP_TOKENS is imported or available via a database/cache layer

export default async function handler(req, res) {
  const { shop } = req.query;
  const client = await clientPromise;
  const db = client.db("shopify_app");
  const collection = db.collection("shops");

  const shopData = await collection.findOne({ shopDomain: shop });
  if (!shopData) return res.status(404).json({ error: "Shop not found" });

  const accessToken = shopData.accessToken;

  if (!accessToken) {
    // In a Next.js app, you'd handle this by redirecting client-side to an auth page
    return res.status(401).json({ error: "Unauthorized or token missing" });
  }

  // Fetch products logic...
  const customersQuery = `{
  customers(first: 5) {
    edges {
      node {
        id
        firstName
        lastName
        email
      }
    }
  }
}`;
  const customersResp = await axios.post(
    `https://${shop}/admin/api/2023-10/graphql.json`,
    { query: customersQuery },
    { headers: { "X-Shopify-Access-Token": accessToken } }
  );
  const customers = customersResp.data.data.customers.edges.map((e) => e.node);

  res.status(200).json({ customers });
}
