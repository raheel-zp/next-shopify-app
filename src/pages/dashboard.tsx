import {
  Page,
  Layout,
  Card,
  ButtonGroup,
  Button,
} from "@shopify/polaris";
import Link from "next/link";

export default function Dashboard() {

  return (
    <Page title="Shopify Dashboard" fullWidth>
      <Layout>

        <Layout.Section>
          <Card>
            <ButtonGroup>
              <Link href={`/products/dbList`}>
                <Button>Products</Button>
              </Link>
              <Link href={`/customers/customersList`}>
                <Button>Customers</Button>
              </Link>
              <Link href={`/orders/ordersList`}>
                <Button>Orders</Button>
              </Link>
              <Link href={`/scopes`}>
                <Button>Api Scopes</Button>
              </Link>
            </ButtonGroup>
          </Card>
        </Layout.Section>

      </Layout>
    </Page >
  );
}
