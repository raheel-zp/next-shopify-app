import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { AxiosError } from "axios";
import clientPromise from "../../lib/mongodb";

interface CustomerNode {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface CustomerEdge {
  node: CustomerNode;
}

interface CustomersResponse {
  customers: {
    edges: CustomerEdge[];
  };
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse) {
  const { shop } = req.query;

  if (!shop) {
    return res.status(400).json({ error: "Shop is required" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("shopify_app");
    const collection = db.collection("shops");

    const shopData = await collection.findOne({ shopDomain: shop });

    if (!shopData) {
      return res.status(404).json({ error: "Shop not found" });
    }

    const accessToken = shopData.accessToken;

    const customersQuery = `
      {
        customers(first: 20) {
          edges {
            node {
              id
              firstName
              lastName
              email
            }
          }
        }
      }
    `;

    const result = await axios.post(
      `https://${shop}/admin/api/2025-01/graphql.json`,
      { query: customersQuery },
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (result.data.errors) {
      console.log("GraphQL errors:", result.data.errors);
    }

    const customers: CustomerNode[] =
  (result.data.data as CustomersResponse)?.customers?.edges.map(
    (e: CustomerEdge) => e.node
  ) || [];

    res.status(200).json(customers);
  }
  catch (err: unknown) {
      const error = err as AxiosError<{ error?: string }>;
      console.error("Customer update error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
}
