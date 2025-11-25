// pages/api/customer.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { AxiosError } from "axios";
import clientPromise from "../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { shop, id } = req.query;

  if (!shop || !id)
    return res.status(400).json({ error: "Missing shop or id" });

  try {
    const client = await clientPromise;
    const db = client.db("shopify_app");
    const shopDoc = await db.collection("shops").findOne({ shopDomain: shop });

    if (!shopDoc) return res.status(404).json({ error: "Shop not found" });

    const accessToken = shopDoc.accessToken;
    if (!accessToken) return res.status(401).json({ error: "Token missing" });

    const gid = `gid://shopify/Customer/${id}`;

    const query = {
      query: `
        query getCustomer($id: ID!) {
          customer(id: $id) {
            id
            firstName
            lastName
            email
            phone
            tags
            state
            createdAt
            updatedAt
            numberOfOrders
          }
        }
      `,
      variables: { id: gid },
    };

    const resp = await axios.post(
      `https://${shop}/admin/api/2024-10/graphql.json`,
      query,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (resp.data.errors) {
      console.error("GraphQL errors:", resp.data.errors);
      return res
        .status(500)
        .json({ error: "GraphQL error", details: resp.data.errors });
    }

    const customer = resp.data.data?.customer || null;
    res.status(200).json(customer);
  } catch (err: unknown) {
    const error = err as AxiosError<{ error?: string }>;
    console.error("Customer update error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
}
