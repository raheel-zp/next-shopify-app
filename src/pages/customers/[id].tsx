import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import {
    Page,
    Layout,
    Card,
    Text,
    Spinner,
    Banner,
    BlockStack,
    Button,
} from "@shopify/polaris";
import axios from "axios";

interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    numberOfOrders: number;
}

export default function CustomerDetail() {
    const router = useRouter();
    const { id, shop } = router.query;

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id || !shop) return;

        async function fetchCustomer() {
            try {
                const resp = await axios.get(`/api/customer?shop=${shop}&id=${id}`);
                setCustomer(resp.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load customer");
            } finally {
                setLoading(false);
            }
        }

        fetchCustomer();
    }, [id, shop]);

    const handleEdit = () => {
        window.location.href = `https://${shop}/admin/customers/${id}`;
    };

    if (loading) {
        return (
            <Page>
                <Layout>
                    <Layout.Section>
                        <Spinner size="large" />
                    </Layout.Section>
                </Layout>
            </Page>
        );
    }

    if (error) {
        return (
            <Page>
                <Layout>
                    <Layout.Section>
                        <Banner tone="critical">
                            <Text as="p">{error}</Text>
                        </Banner>
                    </Layout.Section>
                </Layout>
            </Page>
        );
    }

    if (!customer) {
        return (
            <Page>
                <Layout>
                    <Layout.Section>
                        <Banner tone="warning">
                            <Text as="p">No customer found.</Text>
                        </Banner>
                    </Layout.Section>
                </Layout>
            </Page>
        );
    }

    return (
        <Page title={`Customer: ${customer.firstName} ${customer.lastName}`}>
            <Layout>

                <Layout.Section>
                    <Card>
                        <BlockStack gap="300">
                            <Text as="p" variant="headingMd">Basic Info</Text>
                            <Text as="p">Email: {customer.email}</Text>
                            <Text as="p">Phone: {customer.phone || "N/A"}</Text>
                            <Text as="p">
                                Created At: {new Date(customer.createdAt).toLocaleString()}
                            </Text>
                            <Text as="p">
                                Updated At: {new Date(customer.updatedAt).toLocaleString()}
                            </Text>
                            <Text as="p">Orders: {customer.numberOfOrders}</Text>
                        </BlockStack>
                    </Card>
                </Layout.Section>

                <Layout.Section>
                    <Card>
                        <BlockStack gap="300">
                            <Text as="p" variant="headingMd">Tags</Text>
                            {customer.tags.length === 0 && <Text as="p">No tags</Text>}
                            {customer.tags.map((tag) => (
                                <Text as="p" key={tag}>• {tag}</Text>
                            ))}
                        </BlockStack>
                    </Card>
                </Layout.Section>

                <Layout.Section>
                    <Card>
                        <BlockStack gap="300">
                            <Button
                                onClick={handleEdit}
                            >
                                Edit product
                            </Button>
                        </BlockStack>
                    </Card>
                </Layout.Section>


            </Layout>
        </Page>
    );
}
