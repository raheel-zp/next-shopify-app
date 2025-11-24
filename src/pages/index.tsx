import { useState, useEffect } from 'react';
import {
  Page,
  Card,
  TextField,
  Button,
  Link,
  Layout,
  BlockStack,
  InlineStack,
  Text,
  Banner,
  Spinner
} from '@shopify/polaris';
import axios from "axios";
import { useRouter } from "next/router";

export default function IndexPage() {
  const [shopName, setShopName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkBilling() {
      try {
        const b = await axios.get<{ status: boolean }>(`/api/billingStatus?shop=${shopName}`);
        if (b.data.status) {
          router.push(`/dashboard?shop=${shopName}`);
        }
        else {
          router.push(`/billing?shop=${shopName}`);
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

  }, [router, shopName]);

  const handleInstallClick = () => {
    if (!shopName) {
      setError('Please enter your Shopify store name.');
      return;
    }

    setError('');
    router.push(`/api/auth?shop=${shopName}`);
  };

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
    <Page title="Welcome to the Shopify App">
      <Layout>
        <Layout.Section>
          {error && (
            <Banner tone="critical">
              <Text as="p">{error}</Text>
            </Banner>
          )}

          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                Install Your App
              </Text>

              <Text as="p">
                Enter your store URL to begin the installation process.
              </Text>

              <InlineStack gap="200">
                <TextField
                  label="Shopify Store URL"
                  value={shopName}
                  onChange={setShopName}
                  placeholder="example.myshopify.com"
                  autoComplete="off"
                />

                <Button variant="primary" onClick={handleInstallClick}>
                  Install App
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <BlockStack gap="200">
            <Text as="p">Alternatively, test with a hardcoded link:</Text>
            <Link url="/api/auth?shop=new-dev-store-12324471.myshopify.com">
              Install App for example store
            </Link>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page >
  );
}
