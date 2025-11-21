// pages/api/customers.js
import axios from "axios";
import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  const { shop } = req.query;
  if (!shop) return res.status(400).json({ error: "Shop is required" });

  try {
    const client = await clientPromise;
    const db = client.db("shopify_app");
    const collection = db.collection("shops");

    const shopData = await collection.findOne({ shopDomain: shop });
    if (!shopData) return res.status(404).json({ error: "Shop not found" });

    const accessToken = shopData.accessToken;
    if (!accessToken)
      return res.status(401).json({ error: "Unauthorized or token missing" });

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

    const response = await axios.post(
      `https://${shop}/admin/api/2025-10/graphql.json`,
      { query: customersQuery },
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    const customers = response.data.data.customers.edges.map((e) => e.node);
    res.status(200).json({ customers });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
}
