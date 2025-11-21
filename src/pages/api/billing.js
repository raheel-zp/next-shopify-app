// pages/api/billing.js
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

  const mutation = `
    mutation {
      appSubscriptionCreate(
        name: "Basic Plan",
        returnUrl: "${process.env.MONGO_DB_URI}/dashboard?shop=${shop}",
        test: true,
        lineItems: [{ plan: { appRecurringPricingDetails: { price: { amount: 5.0, currencyCode: USD } } } }]
      ) {
        confirmationUrl
        userErrors { field message }
      }
    }
  `;
  const resp = await axios.post(
    `https://${shop}/admin/api/2025-10/graphql.json`,
    { query: mutation },
    { headers: { "X-Shopify-Access-Token": accessToken } }
  );
  const confirmationUrl = resp.data.data.appSubscriptionCreate.confirmationUrl;
  res.status(200).json(confirmationUrl);
}
