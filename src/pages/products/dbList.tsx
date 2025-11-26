import { useEffect, useState } from "react";
import {
    Page,
    Card,
    IndexTable,
    Select,
    Filters,
    Pagination,
    Avatar,
    Text,
    Spinner,
} from "@shopify/polaris";
import axios from "axios";
import { useShop } from "@/context/ShopContext";
import Link from "next/link";
import Cookies from "js-cookie";

interface Product {
    id: number;
    title: string;
    status: string;
    image?: { src: string };
    variants?: { price: string }[];
    shopDomain: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const { shop, setShop } = useShop();

    useEffect(() => {
        if (!shop) {
            const savedShop = Cookies.get("shop");
            if (savedShop) {
                setShop(savedShop);
            }
        }
    }, [shop, setShop]);

    // Load products asynchronously inside the effect
    useEffect(() => {
        console.log(shop);
        if (!shop) return;

        const fetchProducts = async () => {
            setLoading(true);
            try {
                const resp = await axios.get("/api/productsDb", {
                    params: { shop, page, limit: 20, search, status },
                });
                setProducts(resp.data.products);
                setTotalPages(resp.data.pagination.totalPages);
            } catch (err) {
                console.error("Failed to load products", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [shop, page, search, status]);

    const productRows = products.map((p, index) => (
        <IndexTable.Row id={String(p.id)} key={p.id} position={index}>
            <IndexTable.Cell>
                <Avatar customer name={p.title} source={p.image?.src} />
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text as="span">{p.title}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>{p.status}</IndexTable.Cell>
            <IndexTable.Cell>{p.variants?.[0]?.price || "-"}</IndexTable.Cell>
            <IndexTable.Cell>
                <Link href={`/products/${p.id}`} style={{ color: "#0a66c2" }}>
                    View
                </Link>
            </IndexTable.Cell>
        </IndexTable.Row>
    ));

    const filters = [
        {
            key: "status",
            label: "Status",
            filter: (
                <Select
                    label="Status"
                    labelHidden
                    options={[
                        { label: "Active", value: "active" },
                        { label: "Draft", value: "draft" },
                        { label: "Archived", value: "archived" },
                    ]}
                    value={status || ""}
                    onChange={setStatus}
                />
            ),
            shortcut: true,
        },
    ];

    const appliedFilters = status
        ? [{ key: "status", label: `Status: ${status}`, onRemove: () => setStatus(null) }]
        : [];

    return (
        <Page title="Products" fullWidth>
            <Card>
                <Filters
                    queryValue={search}
                    onQueryChange={setSearch}
                    onQueryClear={() => setSearch("")}
                    filters={filters}
                    appliedFilters={appliedFilters}
                    onClearAll={() => {
                        setSearch("");
                        setStatus(null);
                    }}
                />

                {loading ? (
                    <div style={{ padding: 20 }}>
                        <Spinner />
                    </div>
                ) : (
                    <>
                        <IndexTable
                            resourceName={{ singular: "product", plural: "products" }}
                            itemCount={products.length}
                            headings={[
                                { title: "Image" },
                                { title: "Title" },
                                { title: "Status" },
                                { title: "Price" },
                                { title: "Actions" },
                            ]}
                            selectable={false}
                        >
                            {productRows}
                        </IndexTable>

                        <Pagination
                            hasPrevious={page > 1}
                            onPrevious={() => setPage(page - 1)}
                            hasNext={page < totalPages}
                            onNext={() => setPage(page + 1)}
                        />
                    </>
                )}
            </Card>
        </Page>
    );
}
