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

interface Product {
  id: string;
  title: string;
  price: number;
}


export default function Dashboard() {
  const router = useRouter();
  const { shop, charge_id } = router.query;

  const [products, setProducts] = useState<Product[]>([]);
  //const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [billingActive, setBillingActive] = useState(false);

  useEffect(() => {
    if (!shop) return;

    async function checkBilling() {
      try {
        const b = await axios.get<{ status: boolean }>(`/api/billingStatus?shop=${shop}`);
        if (!b.data.status) {
          router.push(`/billing?shop=${shop}`);
          setBillingActive(true);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      }
    }
    checkBilling();
  }, [shop, router]);

  useEffect(() => {
    if (!shop) return;
    async function fetchData() {
      try {
        const p = await axios.get<Product[]>(`/api/products?shop=${shop}`);
        setProducts(p.data || []);
        // const c = await axios.get<Customer[]>(`/api/customers?shop=${shop}`);
        // setCustomers(c.data);
        setLoading(false);

      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      }
    }

    fetchData();
  }, [shop, router]);

  const productRows = products?.map((p) => [p.id, p.title]);
  // const customerRows = customers.map((c) => [
  //   c.id,
  //   `${c.firstName} ${c.lastName}`,
  //   c.email,
  // ]);

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
    <Page title="Shopify Dashboard">
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
                columnContentTypes={["text", "text"]}
                headings={["ID", "Title"]}
                rows={productRows}
              />
            </Card>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
}
