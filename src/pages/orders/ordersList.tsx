import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import {
    Page,
    Card,
    IndexTable,
    Text,
    Filters,
    Pagination,
    Spinner,
} from "@shopify/polaris";
import axios from "axios";

interface Order {
    id: string;
    name: string;
    customerName?: string;
    totalPrice: string;
    financialStatus: string;
    fulfillmentStatus?: string;
    createdAt: string;
}

export default function OrdersPage() {
    const router = useRouter();
    const { shop } = router.query;

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const load = useCallback(async () => {
        if (!shop) return;
        setLoading(true);

        const resp = await axios.get("/api/ordersDb", {
            params: { shop, page, limit: 20, search },
        });

        setOrders(resp.data.orders);
        setTotalPages(resp.data.pagination.totalPages);
        setLoading(false);
    }, [shop, page, search]);

    useEffect(() => {
        load();
    }, [load]);

    const orderRows = orders.map((o, index) => (
        <IndexTable.Row id={o.id} key={o.id} position={index}>
            <IndexTable.Cell>{o.name}</IndexTable.Cell>
            <IndexTable.Cell>{o.customerName || "-"}</IndexTable.Cell>
            <IndexTable.Cell>{o.totalPrice}</IndexTable.Cell>
            <IndexTable.Cell>{o.financialStatus}</IndexTable.Cell>
            <IndexTable.Cell>{o.fulfillmentStatus || "-"}</IndexTable.Cell>
            <IndexTable.Cell>{new Date(o.createdAt).toLocaleString()}</IndexTable.Cell>
            <IndexTable.Cell>
                <a href={`/orders/${o.id}?shop=${shop}`} style={{ color: "#0a66c2" }}>
                    View
                </a>
            </IndexTable.Cell>
        </IndexTable.Row>
    ));

    return (
        <Page title="Orders" fullWidth>
            <Card>
                <Filters
                    queryValue={search}
                    onQueryChange={setSearch}
                    onQueryClear={() => setSearch("")}
                    filters={[]}
                    appliedFilters={[]}
                    onClearAll={() => setSearch("")}
                />

                {loading ? (
                    <div style={{ padding: 20 }}>
                        <Spinner />
                    </div>
                ) : (
                    <>
                        <IndexTable
                            resourceName={{ singular: "order", plural: "orders" }}
                            itemCount={orders.length}
                            headings={[
                                { title: "Order ID" },
                                { title: "Customer" },
                                { title: "Total Price" },
                                { title: "Financial Status" },
                                { title: "Fulfillment Status" },
                                { title: "Date" },
                                { title: "Actions" },
                            ]}
                            selectable={false}
                        >
                            {orderRows}
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
