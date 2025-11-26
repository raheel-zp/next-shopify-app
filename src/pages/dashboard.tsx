import {
  Page,
  Layout,
  Card,
  ButtonGroup,
  Button,
} from "@shopify/polaris";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const { shop } = router.query;

  return (
    <Page title="Shopify Dashboard" fullWidth>
      <Layout>

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
              <Link href={`/scopes?shop=${shop}`}>
                <Button>Api Scopes</Button>
              </Link>
            </ButtonGroup>
          </Card>
        </Layout.Section>

      </Layout>
    </Page >
  );
}
