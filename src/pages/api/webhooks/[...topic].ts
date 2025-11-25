// pages/api/webhooks/[...topic].ts
import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const topicParts = req.query.topic;

  if (!topicParts || !Array.isArray(topicParts)) {
    return res.status(400).send("Missing topic");
  }

  const topic = topicParts.join("/").toUpperCase();
  console.log("Webhook fired:", topic);

  try {
    const body = req.body;
    const client = await clientPromise;
    const db = client.db("shopify_app");

    switch (topic) {
      case "APP/UNINSTALLED": {
        const shopDomain = body?.domain;
        if (shopDomain) {
          await db.collection("shops").deleteOne({ shopDomain });
          await db.collection("products").deleteMany({ shopDomain });
          await db.collection("customers").deleteMany({ shopDomain });
          await db.collection("orders").deleteMany({ shopDomain });

          console.log("Shop removed from DB:", shopDomain);
        }
        break;
      }

      case "PRODUCTS/UPDATE": {
        const shopDomain = body?.domain;
        const product = body?.product;

        console.log("Received PRODUCT", JSON.stringify(product, null, 2));
        console.log("Shop domain:", shopDomain);
        if (shopDomain && product) {
          try {
            await db.collection("products").updateOne(
              { id: product.id, shopDomain },
              { $set: { ...product, shopDomain, updatedAt: new Date() } },
              { upsert: true }
            );
            console.log("Product saved:", product.id);
          } catch (e) {
            console.error("Product save error:", e);
          }
        }
        break;
      }

      case "CUSTOMERS/UPDATE": {
        const shopDomain = body?.domain;
        const customer = body?.customer;

        console.log("Received CUSTOMER", JSON.stringify(customer, null, 2));

        if (shopDomain && customer) {
          await db.collection("customers").updateOne(
            { id: customer.id, shopDomain },
            { $set: { ...customer, shopDomain, updatedAt: new Date() } },
            { upsert: true }
          );

          console.log("Customer saved:", customer.id);
        }
        break;
      }

      case "ORDERS/CREATE": {
        const shopDomain = body?.domain;
        const order = body?.order;

        console.log("Received ORDER", JSON.stringify(order, null, 2));

        if (shopDomain && order) {
          await db.collection("orders").updateOne(
            { id: order.id, shopDomain },
            { $set: { ...order, shopDomain, createdAt: new Date() } },
            { upsert: true }
          );

          console.log("Order saved:", order.id);
        }
        break;
      }

      default:
        console.log("Unhandled webhook:", topic);
    }

    return res.status(200).send("Webhook processed");
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).send("Webhook processing failed");
  }
}
