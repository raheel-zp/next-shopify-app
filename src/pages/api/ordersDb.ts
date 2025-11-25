// pages/api/ordersDb.ts
import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";

interface Order {
    id: string;
    name: string;
    customerName?: string;
    totalPrice: string;
    financialStatus: string;
    fulfillmentStatus?: string;
    createdAt: string;
    shopDomain: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { shop, page = "1", limit = "20", search = "", status } = req.query;

    if (!shop || typeof shop !== "string") return res.status(400).json({ error: "Missing shop parameter" });

    try {
        const client = await clientPromise;
        const db = client.db("shopify_app");
        const collection = db.collection<Order>("orders");

        type OrCondition = { [K in keyof Order]?: RegExp };

        const query: Partial<Order> & { $or?: OrCondition[] } = { shopDomain: shop };

        if (search && typeof search === "string") {
            query.$or = [
                { name: new RegExp(search, "i") },
                { customerName: new RegExp(search, "i") },
            ];
        }

        if (status && typeof status === "string") {
            query.financialStatus = status;
        }

        const pageNum = parseInt(page.toString(), 10);
        const limitNum = parseInt(limit.toString(), 10);
        const skip = (pageNum - 1) * limitNum;

        const total = await collection.countDocuments(query);
        const orders = await collection
            .find(query)
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json({
            orders,
            pagination: {
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
                total,
            },
        });
    } catch (err) {
        console.error("Failed to fetch orders:", err);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
}
