import { useState, useEffect } from "react";
import Pageloader from "@/components/loader";
import { Page, Card, Text, Banner } from "@shopify/polaris";
import { useRouter } from "next/router";
import axios from "axios";

export default function ScopesPage() {
    const router = useRouter();
    const { shop } = router.query;

    const [scopes, setScopes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!shop) return;

        async function fetchScopes() {
            setLoading(true);
            try {
                const res = await axios.get(`/api/scopes?shop=${shop}`);
                setScopes(res.data.scopes || []);
            } catch (err) {
                console.error(err);
                setError("Failed to load scopes");
            } finally {
                setLoading(false);
            }
        }

        fetchScopes();
    }, [shop]);

    if (!shop) {
        return (
            <Page title="Scopes" fullWidth>
                <Banner tone="critical">
                    <Text as="p">Missing shop parameter in query</Text>
                </Banner>
            </Page>
        );
    }

    if (loading) return <Pageloader />;

    if (error) {
        return (
            <Page title="Scopes" fullWidth>
                <Banner tone="critical">
                    <Text as="p">{error}</Text>
                </Banner>
            </Page>
        );
    }

    return (
        <Page title="Shopify Access Token Scopes" fullWidth>
            <Card>
                <Text as="p">Scopes for store: <strong>{shop}</strong></Text>
                {scopes.length === 0 ? (
                    <Text as="p">No scopes found</Text>
                ) : (
                    <ul>
                        {scopes.map((s) => (
                            <li key={s}>{s}</li>
                        ))}
                    </ul>
                )}
            </Card>
        </Page>
    );
}
