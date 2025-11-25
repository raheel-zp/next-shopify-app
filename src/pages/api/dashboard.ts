// pages/api/dashboard.js
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import clientPromise from "../../lib/mongodb";
// Assume ACTIVE_SHOP_TOKENS is imported or available via a database/cache layer

interface ProductNode {
  id: string;
  title: string;
}

interface ProductEdge {
  node: ProductNode;
}

interface ProductsResponse {
  products: {
    edges: ProductEdge[];
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse) {
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
  const productsQuery = `{ products(first: 5) { edges { node { id title } } } }`;
  const productsResp = await axios.post(
    `https://${shop}/admin/api/2023-10/graphql.json`,
    { query: productsQuery },
    { headers: { "X-Shopify-Access-Token": accessToken } }
  );
  const data = productsResp.data.data as ProductsResponse;
  const products: ProductNode[] = data.products.edges.map(
    (e: ProductEdge) => e.node
  );

  res.status(200).json({ products });
}
