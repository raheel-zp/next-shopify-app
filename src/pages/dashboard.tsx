import {
  Page,
  Layout,
  Card,
  ButtonGroup,
  Button,
} from "@shopify/polaris";
import ShopLink from "@/components/ShopLink";

export default function Dashboard() {

  return (
    <Page title="Shopify Dashboard" fullWidth>
      <Layout>

        <Layout.Section>
          <Card>
            <ButtonGroup>
              <ShopLink href={`/products/dbList`}>
                <Button>Products</Button>
              </ShopLink>
              <ShopLink href={`/customers/customersList`}>
                <Button>Customers</Button>
              </ShopLink>
              <ShopLink href={`/orders/ordersList`}>
                <Button>Orders</Button>
              </ShopLink>
              <ShopLink href={`/scopes`}>
                <Button>Api Scopes</Button>
              </ShopLink>
            </ButtonGroup>
          </Card>
        </Layout.Section>

      </Layout>
    </Page >
  );
}
