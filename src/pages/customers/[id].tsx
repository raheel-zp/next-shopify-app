// pages/customers/[id].tsx
import { useRouter } from "next/router";
import { useShop } from "@/context/ShopContext";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import Pageloader from "@/components/loader";
import {
    Page,
    Layout,
    Card,
    TextField,
    Button,
    Banner,
    Text,
    BlockStack,
} from "@shopify/polaris";
import axios from "axios";
import ShopLink from "@/components/ShopLink";

interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    tags?: string[];
    createdAt?: string;
    updatedAt?: string;
    numberOfOrders?: number;
}

export default function CustomerDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const { shop } = useShop();

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [tagsText, setTagsText] = useState(""); // comma separated

    useEffect(() => {
        if (!id || !shop) return;

        async function load() {
            setLoading(true);
            setError("");
            try {
                const resp = await axios.get(`/api/customer?shop=${shop}&id=${id}`);
                const c = resp.data;
                setCustomer(c);
                setFirstName(c?.firstName || "");
                setLastName(c?.lastName || "");
                setEmail(c?.email || "");
                setPhone(c?.phone || "");
                setTagsText((c?.tags || []).join(", "));
            } catch (err: unknown) {
                const error = err as AxiosError<{ error?: string }>;

                console.error(error);

                setError(error.response?.data?.error || "Failed to load customer");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [id, shop]);

    const handleSave = async () => {
        if (!shop || !id) return;
        setSaving(true);
        setError("");
        setSuccessMessage("");
        try {
            const payload = {
                shop,
                id,
                firstName,
                lastName,
                email,
                phone,
                tags: tagsText,
            };
            const resp = await axios.post("/api/customerUpdate", payload);
            setCustomer(resp.data.customer);
            setSuccessMessage("Customer updated successfully");
        } catch (err: unknown) {
            const error = err as AxiosError<{ error?: string }>;

            console.error(error);

            setError(error.response?.data?.error || "Failed to load customer");
        }
        finally {
            setSaving(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    if (loading) return <Pageloader />;

    return (
        <Page title={`Customer: ${customer?.firstName || ""} ${customer?.lastName || ""}`} fullWidth>
            <Layout>
                <Layout.Section>
                    {error && (
                        <Banner title="Error" tone="critical">
                            <Text as="p">{error}</Text>
                        </Banner>
                    )}

                    {successMessage && (
                        <Banner title="Success" tone="success">
                            <Text as="p">{successMessage}</Text>
                        </Banner>
                    )}
                </Layout.Section>

                <Layout.Section>
                    <Card>
                        <BlockStack>
                            <TextField
                                label="First name"
                                value={firstName}
                                onChange={(v) => setFirstName(v)}
                                autoComplete="off"
                            />
                            <TextField
                                label="Last name"
                                value={lastName}
                                onChange={(v) => setLastName(v)}
                                autoComplete="off"
                            />
                            <TextField label="Email" value={email} onChange={(v) => setEmail(v)} autoComplete="off" />
                            <TextField label="Phone" value={phone} onChange={(v) => setPhone(v)} autoComplete="off" />
                            <TextField
                                label="Tags (comma separated)"
                                value={tagsText}
                                onChange={(v) => setTagsText(v)}
                                helpText="Example: vip, newsletter, beta-tester"
                                autoComplete="off"
                            />

                            <div style={{ display: "flex", gap: 8 }}>
                                <Button onClick={handleSave} loading={saving}>
                                    Save changes
                                </Button>

                                {/* Open native Shopify edit page in new tab (standalone app) */}
                                {shop && id && (
                                    <a
                                        href={`https://${shop}/admin/customers/${id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ textDecoration: "none" }}
                                    >
                                        <Button>Open in Shopify</Button>
                                    </a>
                                )}

                                <ShopLink href={`/customers/customersList`}>
                                    <Button>Back to customers</Button>
                                </ShopLink>
                            </div>
                        </BlockStack>
                    </Card>
                </Layout.Section>

                <Layout.Section>
                    <Card>
                        <Text as="p">
                            Created: {customer?.createdAt ? new Date(customer.createdAt).toLocaleString() : "N/A"}
                        </Text>
                        <Text as="p">
                            Updated: {customer?.updatedAt ? new Date(customer.updatedAt).toLocaleString() : "N/A"}
                        </Text>
                        <Text as="p">Orders: {customer?.numberOfOrders ?? 0}</Text>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
