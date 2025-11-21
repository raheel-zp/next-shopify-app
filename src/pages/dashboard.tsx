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

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { shop } = router.query;

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [billingUrl, setBillingUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!shop) return;

    async function fetchData() {
      try {
        const p = await axios.get<Product[]>(`/api/products?shop=${shop}`);
        setProducts(p.data);

        const c = await axios.get<Customer[]>(`/api/customers?shop=${shop}`);
        setCustomers(c.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      }
    }

    fetchData();
  }, [shop]);

  const handleBilling = async () => {
    try {
      const res = await axios.post<{ url: string }>(
        `/api/billing?shop=${shop}`
      );
      setBillingUrl(res.data.url);
    } catch (err) {
      console.error(err);
      setError("Failed to create billing session");
    }
  };

  const productRows = products.map((p) => [p.id, p.title]);
  const customerRows = customers.map((c) => [
    c.id,
    `${c.firstName} ${c.lastName}`,
    c.email,
  ]);

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

        <Layout.Section>
          <Card>
            <DataTable
              columnContentTypes={["text", "text"]}
              headings={["ID", "Title"]}
              rows={productRows}
            />
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <DataTable
              columnContentTypes={["text", "text", "text"]}
              headings={["ID", "Name", "Email"]}
              rows={customerRows}
            />
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="200">
              <Button variant="primary" onClick={handleBilling}>
                Create / Confirm Billing
              </Button>

              {billingUrl && (
                <Banner>
                  <Text as="p">
                    <a href={billingUrl} target="_blank" rel="noreferrer">
                      Go to Shopify Billing
                    </a>
                  </Text>
                </Banner>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
