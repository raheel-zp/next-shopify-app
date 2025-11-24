import { useEffect, useState } from "react";
import {
    Page,
    Layout,
    Card,
    DataTable,
    Banner,
    Text,
    Spinner,
} from "@shopify/polaris";
import axios from "axios";
import { useRouter } from "next/router";

interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export default function CustomersPage() {
    const router = useRouter();
    const { shop } = router.query;

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [billingActive, setBillingActive] = useState(false);

    useEffect(() => {
        if (!shop) return;

        async function checkBilling() {
            try {
                const b = await axios.get<{ status: boolean }>(
                    `/api/billingStatus?shop=${shop}`
                );
                if (!b.data.status) {
                    router.push(`/billing?shop=${shop}`);
                } else {
                    setBillingActive(true);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to verify billing");
            }
        }

        checkBilling();
    }, [shop]);

    useEffect(() => {
        if (!shop) return;

        async function fetchCustomers() {
            try {
                const resp = await axios.get(`/api/customers?shop=${shop}`);
                setCustomers(resp.data || []);
            } catch (err) {
                console.error(err);
                setError("Failed to load customers");
            } finally {
                setLoading(false);
            }
        }

        fetchCustomers();
    }, [shop]);

    const rows = customers.map((c) => [
        c.id.replace("gid://shopify/Customer/", ""),
        `${c.firstName || ""} ${c.lastName || ""}`,
        c.email,
    ]);

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

    return (
        <Page title="Customers">
            <Layout>
                {error && (
                    <Layout.Section>
                        <Banner tone="critical">
                            <Text as="p">{error}</Text>
                        </Banner>
                    </Layout.Section>
                )}

                {billingActive && (
                    <Layout.Section>
                        <Card>
                            <DataTable
                                columnContentTypes={["text", "text", "text"]}
                                headings={["ID", "Name", "Email"]}
                                rows={rows}
                            />
                        </Card>
                    </Layout.Section>
                )}
            </Layout>
        </Page>
    );
}
