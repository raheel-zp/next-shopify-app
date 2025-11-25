import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosError } from "axios";
import clientPromise from "../../lib/mongodb";

interface Variant {
  id: number;
  title: string;
  price: string;
  inventory_quantity: number;
}

interface Product {
  id: number;
  title: string;
  body_html: string;
  status: string;
  images?: { src: string }[];
  variants: Variant[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { shop, id } = req.query;
  if (!shop || !id) return res.status(400).json({ error: "Missing shop or product ID" });

  try {
    const client = await clientPromise;
    const db = client.db("shopify_app");
    const shopDoc = await db.collection("shops").findOne({ shopDomain: shop.toString() });
    if (!shopDoc) return res.status(404).json({ error: "Shop not found" });

    const accessToken = shopDoc.accessToken;
    if (!accessToken) return res.status(401).json({ error: "Token missing" });

    const response = await axios.get<{ product: Product }>(
      `https://${shop}/admin/api/2025-10/products/${id}.json`,
      {
        headers: { "X-Shopify-Access-Token": accessToken },
      }
    );

    res.status(200).json(response.data.product);
  } catch (err: unknown) {
    const error = err as AxiosError;
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch product" });
  }
}
