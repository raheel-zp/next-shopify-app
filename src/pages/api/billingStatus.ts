// pages/api/billingStatus.js
import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse) {
  const { shop } = req.query;
  const client = await clientPromise;
  const db = client.db("shopify_app");
  const collection = db.collection("shops");

  const shopData = await collection.findOne({ shopDomain: shop });
  if (!shopData) return res.status(200).json({ status: false });

  const billingActive = shopData.billingActive || false;

  res.status(200).json({ status: billingActive });
}
