import { useEffect, useState } from "react";
import Pageloader from "@/components/loader";
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
import { useShopRouter } from "@/utils/useShopRouter";

import { GetServerSideProps } from "next";
import { useShop } from "@/context/ShopContext";

export const getServerSideProps: GetServerSideProps = async (context) => {
    const shop = context.query.shop as string | null;

    if (!shop) {
        return {
            redirect: { destination: "/", permanent: false },
        };
    }

    return {
        props: { shop },
    };
};

export default function Billing() {
    const router = useShopRouter();
    const { shop } = useShop();
    const { charge_id } = router.query;
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!router.isReady) return;
        if (!shop) {
            router.push(`/`);
            return;
        };

        async function checkBilling() {
            try {
                const b = await axios.get<{ status: boolean }>(`/api/billingStatus?shop=${shop}`);
                if (b.data.status) {
                    router.push(`/dashboard`);
                }
            }
            catch (err) {
                console.error(err);
                setError("Failed to load data");
            }
            finally {
                setLoading(false);
            }
        }
        checkBilling();
    }, [router, shop]);

    useEffect(() => {
        if (!charge_id) return;

        async function confirmBilling() {
            setLoading(true);
            try {
                const response = await axios.post(`/api/billing/confirm`, { shop, charge_id });
                if (response.data.success) {
                    router.replace(`/dashboard`, undefined, { shallow: true });
                }
                else {
                    router.push(`/billing`);
                }

            } catch (err) {
                console.error("Failed to confirm billing", err);
            }
            finally {
                setLoading(false);
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

    if (loading) return <Pageloader />;

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

                <Layout.Section>
                    <Card>
                        <BlockStack gap="200">

                            <Button variant="primary" onClick={handleBilling}>
                                Subscribe App
                            </Button>
                        </BlockStack>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
