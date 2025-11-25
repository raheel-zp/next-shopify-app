import { useEffect, useState } from "react";
import {
  Page,
  Layout,
  Card,
  DataTable,
  Banner,
  Text,
  Spinner,
  Button,
} from "@shopify/polaris";
import axios from "axios";
import { useRouter } from "next/router";
import Link from "next/link";

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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [billingActive, setBillingActive] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    if (!shop) {
      router.push(`/`);
      return;
    };
    async function checkBilling() {
      try {
        const b = await axios.get<{ status: boolean }>(`/api/billingStatus?shop=${shop}`);
        if (!b.data.status) {
          router.push(`/billing?shop=${shop}`);
        }
        else {
          setBillingActive(true);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      }
    }
    checkBilling();
  }, [shop, router]);

  if (loading) {
    return (
      <Page fullWidth>
        <Layout>
          <Layout.Section>
            <Spinner size="large" />
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page title="Shopify Dashboard" fullWidth>
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
              <Link href={`/products?shop=${shop}`}>
                <Button>Products</Button>
              </Link>
              <Link href={`/customers?shop=${shop}`}>
                <Button>Customers</Button>
              </Link>
              <Link href={`/orders?shop=${shop}`}>
                <Button>Orders</Button>
              </Link>
            </Card>
          </Layout.Section>
        )}
      </Layout>
    </Page >
  );
}
