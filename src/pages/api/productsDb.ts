import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const client = await clientPromise;
        const db = client.db("shopify_app");

        const {
            shop,
            page = "1",
            limit = "20",
            search = "",
            status = "",
        } = req.query;

        if (!shop || typeof shop !== "string") {
            return res.status(400).json({ error: "Missing shop" });
        }

        const pageNum = Number(page);
        const limitNum = Number(limit);

        const filter: Record<string, unknown> = { shopDomain: shop };

        if (search) {
            filter.title = { $regex: search as string, $options: "i" };
        }

        if (status) {
            filter.status = status;
        }

        const total = await db.collection("products").countDocuments(filter);
        const products = await db
            .collection("products")
            .find(filter)
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .toArray();

        res.status(200).json({
            products,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (err) {
        console.error("DB products fetch error:", err);
        res.status(500).json({ error: "Failed to load products" });
    }
}
