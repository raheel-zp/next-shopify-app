import { useEffect, useState } from "react";
import {
  Page,
  Layout,
  Card,
  ButtonGroup,
  Banner,
  Text,
  Spinner,
  Button,
} from "@shopify/polaris";
import axios from "axios";
import { useRouter } from "next/router";
import Link from "next/link";

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
              <ButtonGroup>
                <Link href={`/products/dbList?shop=${shop}`}>
                  <Button>Products</Button>
                </Link>
                <Link href={`/customers/customersList?shop=${shop}`}>
                  <Button>Customers</Button>
                </Link>
                <Link href={`/orders/ordersList?shop=${shop}`}>
                  <Button>Orders</Button>
                </Link>
              </ButtonGroup>
            </Card>
          </Layout.Section>
        )}
      </Layout>
    </Page >
  );
}
