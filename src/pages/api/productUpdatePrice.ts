import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosError } from "axios";
import clientPromise from "../../lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { shop, id: variantId, price } = req.body;
  if (!shop || !variantId || price == null)
    return res.status(400).json({ error: "Missing parameters" });

  try {
    const client = await clientPromise;
    const db = client.db("shopify_app");
    const shopDoc = await db.collection("shops").findOne({ shopDomain: shop });
    if (!shopDoc) return res.status(404).json({ error: "Shop not found" });

    const accessToken = shopDoc.accessToken;
    if (!accessToken) return res.status(401).json({ error: "Token missing" });

    // Update variant directly
    const updateResp = await axios.put(
      `https://${shop}/admin/api/2025-10/variants/${variantId}.json`,
      { variant: { id: variantId, price: price.toString() } },
      { headers: { "X-Shopify-Access-Token": accessToken } }
    );

    res.status(200).json({ success: true, variant: updateResp.data.variant });
  } catch (err: unknown) {
    const error = err as AxiosError;
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to update variant price" });
  }
}
