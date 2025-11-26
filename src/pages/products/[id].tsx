import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios, { AxiosError } from "axios";
import Pageloader from "@/components/loader";
import {
    Page,
    Layout,
    Card,
    Text,
    Button,
    DataTable,
    Banner,
    TextField,
} from "@shopify/polaris";
import Image from "next/image";
import { useShop } from "@/context/ShopContext";

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
    const { id } = router.query;
    const { shop } = useShop();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [variantPrices, setVariantPrices] = useState<{ [variantId: number]: string }>({});
    const [savingVariantId, setSavingVariantId] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [priceError, setPriceError] = useState("");

    // Fetch product
    useEffect(() => {
        if (!shop || !id) return;

        async function fetchProduct() {
            setLoading(true);
            setError("");
            try {
                const resp = await axios.get<Product>(`/api/product?shop=${shop}&id=${id}`);
                setProduct(resp.data);

                // Initialize variantPrices state
                const prices: { [variantId: number]: string } = {};
                resp.data.variants.forEach((v) => (prices[v.id] = v.price));
                setVariantPrices(prices);
            } catch (err: unknown) {
                const axiosError = err as AxiosError;
                console.error("Error fetching product:", axiosError.response?.data || axiosError.message);
                setError("Failed to load product");
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [shop, id]);

    // Update single variant price
    const handleUpdatePrice = async (variantId: number) => {
        const newPrice = variantPrices[variantId];
        if (!shop || !id || !newPrice) return;

        setSavingVariantId(variantId);
        setSuccessMessage("");
        setPriceError("");

        try {
            const resp = await axios.post<{ success: boolean; error?: string }>("/api/productUpdatePrice", {
                shop,
                id: variantId,
                price: parseFloat(newPrice),
            });

            if (resp.data.success) {
                setSuccessMessage(`Variant ${variantId} price updated successfully!`);
                setProduct((prev) =>
                    prev
                        ? {
                            ...prev,
                            variants: prev.variants.map((v) =>
                                v.id === variantId ? { ...v, price: newPrice } : v
                            ),
                        }
                        : prev
                );
            } else {
                setPriceError(resp.data.error || "Failed to update price");
            }
        } catch (err: unknown) {
            const axiosError = err as AxiosError<{ error?: string }>;
            setPriceError(axiosError.response?.data?.error || "Error updating price");
        } finally {
            setSavingVariantId(null);
        }
    };

    if (loading) return <Pageloader />;

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
        <Page title={`Product: ${product.title}`} fullWidth>
            <Layout>
                {/* Product Info */}
                <Layout.Section>
                    <Card>
                        <div style={{ padding: "16px" }}>
                            <Text as="p" variant="headingMd">{product.title}</Text>
                            {product.body_html && (
                                <div
                                    style={{ marginTop: "8px" }}
                                    dangerouslySetInnerHTML={{ __html: product.body_html }}
                                />
                            )}
                        </div>
                    </Card>
                </Layout.Section>

                {/* Product Images */}
                {product.images && product.images.length > 0 && (
                    <Layout.Section>
                        <Card>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", padding: "16px" }}>
                                {product.images.map((img) => (
                                    <Image
                                        key={img.src}
                                        src={img.src}
                                        alt={product.title}
                                        width={150}
                                        height={150}
                                    />
                                ))}
                            </div>
                        </Card>
                    </Layout.Section>
                )}

                {/* Variants Table */}
                <Layout.Section>
                    <Card>
                        <div style={{ padding: "16px" }}>
                            <DataTable
                                columnContentTypes={["text", "text", "text", "numeric", "text"]}
                                headings={["ID", "Title", "Price", "Inventory", "Update Price"]}
                                rows={product.variants.map((v) => [
                                    v.id.toString(),
                                    v.title,
                                    v.price,
                                    v.inventory_quantity,
                                    "" // We'll render the input/button below
                                ])}
                            />
                        </div>
                    </Card>
                </Layout.Section>

                {/* Update Price Form for each variant */}
                <Layout.Section>
                    {product.variants.map((v) => (
                        <Card key={v.id}>
                            <div style={{ padding: "16px", display: "flex", gap: "8px", alignItems: "flex-end" }}>
                                <TextField
                                    label={`Price for ${v.title}`}
                                    type="number"
                                    value={variantPrices[v.id] || ""}
                                    onChange={(val) => setVariantPrices((prev) => ({ ...prev, [v.id]: val }))}
                                    autoComplete="off"
                                />
                                <Button
                                    onClick={() => handleUpdatePrice(v.id)}
                                    loading={savingVariantId === v.id}
                                >
                                    Update Price
                                </Button>
                            </div>
                        </Card>
                    ))}
                </Layout.Section>

                {/* Success/Error Banner */}
                <Layout.Section>
                    {successMessage && (
                        <Banner title="Success" tone="success">
                            <Text as="p">{successMessage}</Text>
                        </Banner>
                    )}
                    {priceError && (
                        <Banner title="Error" tone="critical">
                            <Text as="p">{priceError}</Text>
                        </Banner>
                    )}
                </Layout.Section>

                {/* Edit in Shopify Button */}
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
