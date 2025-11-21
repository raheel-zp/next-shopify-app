// pages/api/dashboard.js
import axios from "axios";
import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  const { shop } = req.query;
  const client = await clientPromise;
  const db = client.db("shopify_app");
  const collection = db.collection("shops");

  const shopData = await collection.findOne({ shopDomain: shop });
  if (!shopData) return res.status(404).json({ error: "Shop not found" });

  const accessToken = shopData.accessToken;

  if (!accessToken) {
    return res.status(401).json({ error: "Unauthorized or token missing" });
  }

  const productsQuery = `{ products(first: 5) { edges { node { id title } } } }`;
  const productsResp = await axios.post(
    `https://${shop}/admin/api/2025-10/graphql.json`,
    { query: productsQuery },
    { headers: { "X-Shopify-Access-Token": accessToken } }
  );
  const products = productsResp.data.data.products.edges.map((e) => e.node);

  res.status(200).json(products);
}
