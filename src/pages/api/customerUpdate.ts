// pages/api/customerUpdate.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { AxiosError } from "axios";
import clientPromise from "../../lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { shop, id, firstName, lastName, email, phone, tags } = req.body;

  if (!shop || !id) return res.status(400).json({ error: "Missing shop or id" });

  try {
    const client = await clientPromise;
    const db = client.db("shopify_app");
    const shopDoc = await db.collection("shops").findOne({ shopDomain: shop });

    if (!shopDoc) return res.status(404).json({ error: "Shop not found" });

    const accessToken = shopDoc.accessToken;
    if (!accessToken) return res.status(401).json({ error: "Token missing" });

    // tags may be sent as comma-separated string or array
    const tagsArray = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
      ? tags.split(",").map((t: string) => t.trim()).filter(Boolean)
      : [];

    const gid = `gid://shopify/Customer/${id}`;

    const mutation = {
      query: `
        mutation customerUpdate($input: CustomerInput!) {
          customerUpdate(input: $input) {
            customer {
              id
              firstName
              lastName
              email
              phone
              tags
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: {
        input: {
          id: gid,
          firstName: firstName || null,
          lastName: lastName || null,
          email: email || null,
          phone: phone || null,
          tags: tagsArray.length ? tagsArray : null,
        },
      },
    };

    const resp = await axios.post(
      `https://${shop}/admin/api/2024-10/graphql.json`,
      mutation,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (resp.data.errors) {
      console.error("GraphQL errors:", resp.data.errors);
      return res.status(500).json({ error: "GraphQL error", details: resp.data.errors });
    }

    const result = resp.data.data?.customerUpdate;
    if (result?.userErrors && result.userErrors.length > 0) {
      return res.status(400).json({ userErrors: result.userErrors });
    }

    res.status(200).json({ customer: result.customer });
  } catch (err: unknown) {
  const error = err as AxiosError<{ error?: string }>;
  console.error("Customer update error:", error.response?.data || error.message);
  res.status(500).json({ error: "Failed to update customer" });
}
}
