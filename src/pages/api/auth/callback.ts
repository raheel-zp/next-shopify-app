// pages/api/auth/callback.js
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { AxiosError } from "axios";
import clientPromise from "../../../lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { shop, code } = req.query;
  if (!shop || !code) {
    return res.status(400).send("Missing parameters");
  }

  const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET } = process.env;

  try {
    const tokenUrl = `https://${shop}/admin/oauth/access_token`;
    const { data } = await axios.post(tokenUrl, {
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code,
    });

    const client = await clientPromise;
    const db = client.db("shopify_app");
    const collection = db.collection("shops");

    await collection.updateOne(
      { shopDomain: shop },
      { $set: { accessToken: data.access_token, updatedAt: new Date() } },
      { upsert: true }
    );

    const topics = [
    "app/uninstalled",
    "products/update",
    "customers/update",
    "orders/create",
  ];

  for (const topic of topics) {
    try {
      await axios.post(
        `https://${shop}/admin/api/2025-10/webhooks.json`,
        {
          webhook: {
            topic,
            address: `https://next-shopify-app-mu.vercel.app/api/webhooks/${topic}`,
            format: "json",
          },
        },
        {
          headers: {
            "X-Shopify-Access-Token": data.access_token,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(`Webhook registered for ${topic}`);
    } catch (err) {
      console.error(`Failed to register webhook ${topic}:`, err);
    }
  }

    res.redirect(`/billing?shop=${shop}`);
  }
  catch (err: unknown) {
    const error = err as AxiosError<{ error?: string }>;
    console.error("Customer update error:", error.response?.data || error.message);
    res.status(500).send("Error exchanging token");
  }

}
