// pages/api/billing/confirm.js
import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";

export default async function handler(req: NextApiRequest,
  res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { shop, charge_id } = req.body;
  if (!shop || !charge_id)
    return res.status(400).json({ error: "Missing parameters" });

  const client = await clientPromise;
  const db = client.db("shopify_app");
  const collection = db.collection("shops");

  // Update billing status in DB
  await collection.updateOne(
    { shopDomain: shop },
    { $set: { billingActive: true, billingChargeId: charge_id } }
  );

  res.status(200).json({ success: true });
}
