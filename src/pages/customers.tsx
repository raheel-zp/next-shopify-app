import { useEffect, useState } from "react";
import {
    Page,
    Layout,
    Card,
    DataTable,
    Banner,
    Text,
} from "@shopify/polaris";
import axios from "axios";
import { useRouter } from "next/router";
import Link from "next/link";

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
    const [error, setError] = useState("");

    useEffect(() => {
        if (!shop) return;

        async function fetchCustomers() {
            try {
                const resp = await axios.get(`/api/customers?shop=${shop}`);
                setCustomers(resp.data || []);
            } catch (err) {
                console.error(err);
                setError("Failed to load customers");
            }
        }

        fetchCustomers();
    }, [shop]);

    const rows = customers.map((c) => {
        const customerId = c.id.replace("gid://shopify/Customer/", "");

        return [
            customerId,
            <Link key={customerId} href={`/customers/${customerId}?shop=${shop}`}>
                {c.firstName} {c.lastName}
            </Link>,
            c.email,
        ];
    });

    return (
        <Page title="Customers" fullWidth>
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
                        <DataTable
                            columnContentTypes={["text", "text", "text"]}
                            headings={["ID", "Name", "Email"]}
                            rows={rows}
                        />
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
