import { useEffect, useState } from "react";
import axios from "axios";
import {
    Page,
    Layout,
    Card,
    DataTable,
    Spinner,
    Text,
    Banner,
} from "@shopify/polaris";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

interface Product {
    id: number;
    title: string;
    status: string;
    inventory_quantity?: number;
    variants?: { price: string; id: number }[];
    images?: { src: string }[];
}

export default function ProductsPage() {
    const router = useRouter();
    const { shop } = router.query;
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!shop) return;

        async function fetchProducts() {
            setLoading(true);
            try {
                const resp = await axios.get<Product[]>(`/api/products?shop=${shop}`);
                setProducts(resp.data);
            } catch (err: unknown) {
                console.error(err);
                setError("Failed to load products");
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, [shop]);

    if (loading) return <Spinner size="large" />;

    if (error)
        return (
            <Page>
                <Banner title="Error" tone="critical">
                    <Text as="p">{error}</Text>
                </Banner>
            </Page>
        );

    const rows = products.map((p) => [
        <Image key={p.id} src={p.images?.[0]?.src || ""} alt={p.title} width={50} />,
        <Link key={p.id} href={`/products/${p.id}?shop=${shop}`}>
            {p.title}
        </Link>,
        p.status,
        p.inventory_quantity ?? 0,
        p.variants?.[0]?.price ?? "N/A",
    ]);

    return (
        <Page title="Products">
            <Layout>
                <Layout.Section>
                    <Card>
                        <DataTable
                            columnContentTypes={["text", "text", "text", "numeric", "text"]}
                            headings={["Image", "Name", "Status", "Inventory", "Price"]}
                            rows={rows}
                        />
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
