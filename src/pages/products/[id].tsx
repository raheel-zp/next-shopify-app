import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios, { AxiosError } from "axios";
import {
    Page,
    Layout,
    Card,
    Text,
    Button,
    Spinner,
    DataTable,
    Banner,
    BlockStack,
} from "@shopify/polaris";
import Image from "next/image";
interface Variant {
    id: number;
    title: string;
    price: string;
    inventory_quantity: number;
}

interface Product {
    id: number;
    title: string;
    body_html: string;
    status: string;
    images?: { src: string }[];
    variants: Variant[];
}

export default function ProductDetailPage() {
    const router = useRouter();
    const { id, shop } = router.query;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!shop || !id) return;

        async function fetchProduct() {
            setLoading(true);
            try {
                const resp = await axios.get<Product>(
                    `/api/product?shop=${shop}&id=${id}`
                );
                setProduct(resp.data);
            } catch (err: unknown) {
                const error = err as AxiosError;
                console.error(error.response?.data || error.message);
                setError("Failed to load product");
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [shop, id]);

    if (loading) return <Spinner size="large" />;

    if (error)
        return (
            <Page>
                <Banner title="Error" tone="critical">
                    <Text as="p">{error}</Text>
                </Banner>
            </Page>
        );

    if (!product) return <Page title="Product not found" />;

    return (
        <Page title={`Product: ${product.title}`}>
            <Layout>
                <Layout.Section>
                    <Card>
                        <BlockStack>
                            <Text as="p" variant="headingMd">{product.title}</Text>
                            <div dangerouslySetInnerHTML={{ __html: product.body_html }} />
                        </BlockStack>
                    </Card>
                </Layout.Section>

                {product.images && product.images.length > 0 && (
                    <Layout.Section>
                        <Card>
                            <BlockStack>
                                {product.images.map((img) => (
                                    <Image key={img.src} src={img.src} alt={product.title} width={150} height={150} />
                                ))}
                            </BlockStack>
                        </Card>
                    </Layout.Section>
                )}

                <Layout.Section>
                    <Card>
                        <DataTable
                            columnContentTypes={["text", "text", "text", "numeric"]}
                            headings={["ID", "Title", "Price", "Inventory"]}
                            rows={product.variants.map((v) => [
                                v.id,
                                v.title,
                                v.price,
                                v.inventory_quantity,
                            ])}
                        />
                    </Card>
                </Layout.Section>

                <Layout.Section>
                    <Button
                        url={`https://${shop}/admin/products/${id}`}
                        external
                        target="_blank"
                    >
                        Edit in Shopify
                    </Button>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
