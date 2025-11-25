import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosError } from "axios";
import clientPromise from "../../lib/mongodb";

interface LineItem {
  id: number;
  title: string;
  quantity: number;
  price: string;
  sku?: string;
}

interface Address {
  first_name: string;
  last_name: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  country: string;
  zip: string;
  phone?: string;
}

interface Order {
  id: number;
  name: string;
  email: string;
  total_price: string;
  financial_status: string;
  fulfillment_status: string | null;
  created_at: string;
  line_items: LineItem[];
  shipping_address?: Address;
  billing_address?: Address;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { shop, id } = req.query;
  if (!shop || !id) return res.status(400).json({ error: "Missing shop or order id" });

  try {
    const client = await clientPromise;
    const db = client.db("shopify_app");
    const shopDoc = await db.collection("shops").findOne({ shopDomain: shop });
    if (!shopDoc) return res.status(404).json({ error: "Shop not found" });

    const accessToken = shopDoc.accessToken;
    if (!accessToken) return res.status(401).json({ error: "Token missing" });

    const response = await axios.get<{ order: Order }>(
      `https://${shop}/admin/api/2025-10/orders/${id}.json`,
      {
        headers: { "X-Shopify-Access-Token": accessToken },
      }
    );

    const order = response.data.order;
    res.status(200).json(order);
  } catch (err: unknown) {
    const error = err as AxiosError;
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch order" });
  }
}
