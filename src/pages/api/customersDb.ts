// pages/api/customersDb.ts
import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";

interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    tags?: string[];
    shopDomain: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { shop, page = "1", limit = "20", search = "", tag } = req.query;

    if (!shop || typeof shop !== "string") return res.status(400).json({ error: "Missing shop parameter" });

    try {
        const client = await clientPromise;
        const db = client.db("shopify_app");
        const collection = db.collection<Customer>("customers");

        type OrCondition = {
            [K in keyof Customer]?: { $regex: string; $options: "i" };
        };

        const query: Partial<Customer> & { $or?: OrCondition[] } = { shopDomain: shop };

        if (search && typeof search === "string") {
            query.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        if (tag && typeof tag === "string") {
            query.tags = [tag];
        }

        const pageNum = parseInt(page.toString(), 10);
        const limitNum = parseInt(limit.toString(), 10);
        const skip = (pageNum - 1) * limitNum;

        const total = await collection.countDocuments(query);
        const customers = await collection
            .find(query)
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json({
            customers,
            pagination: {
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
                total,
            },
        });
    } catch (err) {
        console.error("Failed to fetch customers:", err);
        res.status(500).json({ error: "Failed to fetch customers" });
    }
}
