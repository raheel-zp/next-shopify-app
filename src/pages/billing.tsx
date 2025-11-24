import { useEffect, useState } from "react";
import {
    Page,
    Layout,
    Card,
    DataTable,
    Banner,
    Button,
    BlockStack,
    Text,
} from "@shopify/polaris";
import axios from "axios";
import { useRouter } from "next/router";

interface Product {
    id: string;
    title: string;
    price: number;
}


export default function Billing() {
    const router = useRouter();
    const { shop, charge_id } = router.query;
    const [error, setError] = useState("");
    const [billingActive, setBillingActive] = useState(false);

    useEffect(() => {

        if (!charge_id) return;
        async function confirmBilling() {
            try {
                const response = await axios.post(`/api/billing/confirm`, { shop, charge_id });
                if (response.data.success) {
                    setBillingActive(true);
                    router.push(`/dashboard?shop=${shop}`);
                }

            } catch (err) {
                console.error("Failed to confirm billing", err);
            }
        }

        confirmBilling();

    }, [charge_id, router, shop]);

    const handleBilling = async () => {
        try {
            const res = await axios.post<{ url: string }>(
                `/api/billing?shop=${shop}`
            );
            router.push(res.data.url);
        } catch (err) {
            console.error(err);
            setError("Failed to create billing session");
        }
    };

    return (
        <Page title="Shopify Dashboard">
            <Layout>
                {error && (
                    <Layout.Section>
                        <Banner tone="critical">
                            <Text as="p">{error}</Text>
                        </Banner>
                    </Layout.Section>
                )}

                {!billingActive && (
                    <Layout.Section>
                        <Card>
                            <BlockStack gap="200">

                                <Button variant="primary" onClick={handleBilling}>
                                    Subscribe App
                                </Button>
                            </BlockStack>
                        </Card>
                    </Layout.Section>
                )}
            </Layout>
        </Page>
    );
}
