import { useEffect, useState } from "react";
import {
    Page,
    Layout,
    Card,
    Banner,
    Button,
    BlockStack,
    Text,
} from "@shopify/polaris";
import axios from "axios";
import { useRouter } from "next/router";

export default function Billing() {
    const router = useRouter();
    const { shop } = router.query;
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!shop) return;
        async function checkBilling() {
            try {
                const b = await axios.get<{ status: boolean }>(`/api/billingStatus?shop=${shop}`);
                if (b.data.status) {
                    router.push(`/dashboard?shop=${shop}`);
                }
                else {
                    setLoading(false);
                }
            }
            catch (err) {
                console.error(err);
                setError("Failed to load data");
            }
        }
        checkBilling();
    }, [router, shop]);

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
        <Page title="Approve Billing">
            <Layout>
                {error && (
                    <Layout.Section>
                        <Banner tone="critical">
                            <Text as="p">{error}</Text>
                        </Banner>
                    </Layout.Section>
                )}

                {!loading && (
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
