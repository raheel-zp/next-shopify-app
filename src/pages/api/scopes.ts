// pages/api/scopes.js
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { AxiosError } from "axios";
import clientPromise from "../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse) {
  const { shop } = req.query;
  if (!shop) return res.status(400).json({ error: "Shop parameter missing" });

  try {
    const client = await clientPromise;
    const db = client.db("shopify_app");
    const collection = db.collection("shops");

    const shopData = await collection.findOne({ shopDomain: shop });
    if (!shopData) return res.status(404).json({ error: "Shop not found" });

    const accessToken = shopData.accessToken;
    if (!accessToken)
      return res.status(401).json({ error: "Unauthorized or token missing" });

    // Shopify REST endpoint to check token scopes
    const response = await axios.get(
      `https://${shop}/admin/oauth/access_scopes.json`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
        },
      }
    );

    const scopes = response.data.access_scopes.map((s: {handle: string}) => s.handle);
    res.status(200).json({ scopes });
  } catch (err: unknown) {
      const error = err as AxiosError<{ error?: string }>;
      console.error("Customer update error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch scopes" });
    }
}
