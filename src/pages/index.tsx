import { useState } from 'react';
import { Page, Card, FormLayout, TextField, Button, Link, Layout } from '@shopify/polaris';
import { useRouter } from 'next/router';

export default function IndexPage() {
  const [shopName, setShopName] = useState('');
  const router = useRouter();

  // Handle installation click
  const handleInstallClick = () => {
    if (shopName) {
      // Redirect to the Next.js API route that handles OAuth
      router.push(`/api/auth?shop=${shopName}`);
    } else {
      alert("Please enter your Shopify store name.");
    }
  };

  return (
    <Page title="Welcome to the Shopify App">
      <Layout>
        <Layout.Section>
          <Card sectioned title="Install Your App">
            <p>Enter your store URL to begin the installation process.</p>
            <FormLayout>
              <TextField
                label="Shopify Store URL"
                value={shopName}
                onChange={setShopName}
                placeholder="your-store-name.myshopify.com"
                connectedRight={
                  <Button primary onClick={handleInstallClick}>
                    Install App
                  </Button>
                }
              />
            </FormLayout>
          </Card>
        </Layout.Section>
        <Layout.Section>
          {/* Example link for quick testing, replace with a valid shop URL */}
          <p>
            Alternatively, test with a hardcoded link:
            <br />
            <Link url="/api/auth?shop=new-dev-store-12324471.myshopify.com">
              Install App for example store
            </Link>
          </p>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
