import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios, { AxiosError } from "axios";
import Pageloader from "@/components/loader";
import {
    Page,
    Layout,
    Card,
    Text,
    Banner,
    DataTable,
    Button,
    BlockStack,
} from "@shopify/polaris";
import Link from "next/link";

interface LineItem {
    id: number;
    title: string;
    quantity: number;
    price: string;
    sku?: string;
}

interface Address {
    first_name: string;
    last_name: string;
    address1: string;
    address2?: string;
    city: string;
    province?: string;
    country: string;
    zip: string;
    phone?: string;
}

interface Order {
    id: number;
    name: string;
    email: string;
    total_price: string;
    financial_status: string;
    fulfillment_status: string | null;
    created_at: string;
    line_items: LineItem[];
    shipping_address?: Address;
    billing_address?: Address;
}

export default function OrderDetailPage() {
    const router = useRouter();
    const { id, shop } = router.query;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id || !shop) return;

        async function loadOrder() {
            setLoading(true);
            try {
                const resp = await axios.get(`/api/order?shop=${shop}&id=${id}`);
                setOrder(resp.data);
            } catch (err: unknown) {
                const axiosError = err as AxiosError<{ error?: string }>;
                setError(axiosError.response?.data?.error || "Failed to load order");
            } finally {
                setLoading(false);
            }
        }

        loadOrder();
    }, [id, shop]);

    if (loading) return <Pageloader />;

    if (!order) return null;

    const lineItemsRows = order.line_items.map((li) => [
        li.title,
        li.quantity.toString(),
        `$${li.price}`,
        li.sku || "-",
    ]);

    return (
        <Page title={`Order: ${order.name}`} fullWidth>
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
                        <BlockStack>
                            <Text as="p">Customer Email: {order.email}</Text>
                            <Text as="p">Total Price: ${order.total_price}</Text>
                            <Text as="p">Financial Status: {order.financial_status}</Text>
                            <Text as="p">Fulfillment Status: {order.fulfillment_status || "Unfulfilled"}</Text>
                            <Text as="p">Created At: {new Date(order.created_at).toLocaleString()}</Text>
                        </BlockStack>
                    </Card>
                </Layout.Section>

                <Layout.Section>
                    <Card>
                        <DataTable
                            columnContentTypes={["text", "text", "text", "text"]}
                            headings={["Title", "Quantity", "Price", "SKU"]}
                            rows={lineItemsRows}
                        />
                    </Card>
                </Layout.Section>

                {order.shipping_address && (
                    <Layout.Section>
                        <Card>
                            <Text as="p">{`${order.shipping_address.first_name} ${order.shipping_address.last_name}`}</Text>
                            <Text as="p">{order.shipping_address.address1}</Text>
                            {order.shipping_address.address2 && <Text as="p">{order.shipping_address.address2}</Text>}
                            <Text as="p">{`${order.shipping_address.city}, ${order.shipping_address.province || ""}, ${order.shipping_address.country}, ${order.shipping_address.zip}`}</Text>
                            {order.shipping_address.phone && <Text as="p">Phone: {order.shipping_address.phone}</Text>}
                        </Card>
                    </Layout.Section>
                )}

                {order.billing_address && (
                    <Layout.Section>
                        <Card>
                            <Text as="p">{`${order.billing_address.first_name} ${order.billing_address.last_name}`}</Text>
                            <Text as="p">{order.billing_address.address1}</Text>
                            {order.billing_address.address2 && <Text as="p">{order.billing_address.address2}</Text>}
                            <Text as="p">{`${order.billing_address.city}, ${order.billing_address.province || ""}, ${order.billing_address.country}, ${order.billing_address.zip}`}</Text>
                            {order.billing_address.phone && <Text as="p">Phone: {order.billing_address.phone}</Text>}
                        </Card>
                    </Layout.Section>
                )}

                <Layout.Section>
                    <Link href={`/orders?shop=${shop}`}>
                        <Button>Back to Orders</Button>
                    </Link>
                    {shop && (
                        <a href={`https://${shop}/admin/orders/${id}`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}>
                            <Button>View in Shopify</Button>
                        </a>
                    )}
                </Layout.Section>
            </Layout>
        </Page>
    );
}
