import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosError } from "axios";
import clientPromise from "../../lib/mongodb";

interface Order {
  id: number;
  name: string;
  email: string;
  total_price: string;
  financial_status: string;
  fulfillment_status: string | null;
  created_at: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { shop } = req.query;
  if (!shop) return res.status(400).json({ error: "Shop is required" });

  try {
    const client = await clientPromise;
    const db = client.db("shopify_app");
    const shopDoc = await db.collection("shops").findOne({ shopDomain: shop });
    if (!shopDoc) return res.status(404).json({ error: "Shop not found" });

    const accessToken = shopDoc.accessToken;
    if (!accessToken) return res.status(401).json({ error: "Token missing" });

    const response = await axios.get<{ orders: Order[] }>(
      `https://${shop}/admin/api/2025-10/orders.json?limit=20`,
      {
        headers: { "X-Shopify-Access-Token": accessToken },
      }
    );

    const orders = response.data.orders;
    res.status(200).json(orders);
  } catch (err: unknown) {
    const error = err as AxiosError;
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
}
