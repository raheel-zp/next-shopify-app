import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Pageloader from "@/components/loader";
import {
    Page,
    Layout,
    Card,
    DataTable,
    Banner,
    Text,
} from "@shopify/polaris";
import ShopLink from "@/components/ShopLink";

interface Order {
    id: number;
    name: string;
    email: string;
    total_price: string;
    financial_status: string;
    fulfillment_status: string | null;
    created_at: string;
}

export default function OrdersPage() {
    const router = useRouter();
    const { shop } = router.query;

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!shop) return;

        async function fetchOrders() {
            setLoading(true);
            try {
                const resp = await axios.get(`/api/orders?shop=${shop}`);
                setOrders(resp.data || []);
            } catch (err: unknown) {
                console.error(err);
                setError("Failed to load orders");
            } finally {
                setLoading(false);
            }
        }

        fetchOrders();
    }, [shop]);

    if (loading) return <Pageloader />;

    const rows = orders.map((o) => [
        o.name,
        o.email,
        `$${o.total_price}`,
        o.financial_status,
        o.fulfillment_status || "Unfulfilled",
        new Date(o.created_at).toLocaleString(),
        <ShopLink key={o.id} href={`/orders/${o.id}`}>
            View
        </ShopLink>,
    ]);

    return (
        <Page title="Orders" fullWidth>
            <Layout>
                {error && (
                    <Layout.Section>
                        <Banner title="Error" tone="critical">
                            <Text as="p">{error}</Text>
                        </Banner>
                    </Layout.Section>
                )}
                <Layout.Section>
                    <Card>
                        <DataTable
                            columnContentTypes={["text", "text", "text", "text", "text", "text", "text"]}
                            headings={[
                                "Order ID",
                                "Customer",
                                "Total Price",
                                "Financial Status",
                                "Fulfillment Status",
                                "Date",
                                "Action",
                            ]}
                            rows={rows}
                        />
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
