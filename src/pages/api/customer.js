import axios from "axios";
import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  const { shop, id } = req.query;

  if (!shop || !id)
    return res.status(400).json({ error: "Missing shop or customer ID" });

  try {
    const client = await clientPromise;
    const db = client.db("shopify_app");
    const shopDoc = await db.collection("shops").findOne({ shopDomain: shop });

    if (!shopDoc) return res.status(404).json({ error: "Shop not found" });

    const accessToken = shopDoc.accessToken;

    const query = `
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
    `;
    const customerId = "gid://shopify/Customer/".id;
    const result = await axios.post(
      `https://${shop}/admin/api/2025-01/graphql.json`,
      { query, variables: { id: customerId } },
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json(result.data.data.customer);
  } catch (err) {
    console.error("Customer fetch error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
}
