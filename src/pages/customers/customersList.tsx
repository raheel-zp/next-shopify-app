// pages/customers/index.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
    Page,
    Card,
    IndexTable,
    TextField,
    Filters,
    Pagination,
    Avatar,
    Text,
    Spinner,
} from "@shopify/polaris";
import axios from "axios";

interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    tags?: string[];
    shopDomain: string;
}

export default function CustomersPage() {
    const router = useRouter();
    const { shop } = router.query;

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [tagFilter, setTagFilter] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!shop) return;

        const fetchCustomers = async () => {
            setLoading(true);
            try {
                const resp = await axios.get("/api/customersDb", {
                    params: { shop, page, limit: 20, search, tag: tagFilter },
                });
                setCustomers(resp.data.customers);
                setTotalPages(resp.data.pagination.totalPages);
            } catch (err) {
                console.error("Failed to load customers", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, [shop, page, search, tagFilter]);

    const customerRows = customers.map((c, index) => (
        <IndexTable.Row id={c.id} key={c.id} position={index}>
            <IndexTable.Cell>
                <Avatar customer name={`${c.firstName} ${c.lastName}`} />
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text as="span">{c.firstName} {c.lastName}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>{c.email}</IndexTable.Cell>
            <IndexTable.Cell>{c.phone || "-"}</IndexTable.Cell>
            <IndexTable.Cell>
                <a href={`/customers/${c.id}?shop=${shop}`} style={{ color: "#0a66c2" }}>
                    View
                </a>
            </IndexTable.Cell>
        </IndexTable.Row>
    ));

    const filters = [
        {
            key: "tags",
            label: "Tags",
            filter: (
                <TextField
                    label="Tag"
                    labelHidden
                    placeholder="Filter by tag"
                    value={tagFilter || ""}
                    onChange={setTagFilter}
                    autoComplete="false"
                />
            ),
            shortcut: true,
        },
    ];

    const appliedFilters = tagFilter
        ? [{ key: "tags", label: `Tag: ${tagFilter}`, onRemove: () => setTagFilter(null) }]
        : [];

    return (
        <Page title="Customers" fullWidth>
            <Card>
                <Filters
                    queryValue={search}
                    onQueryChange={setSearch}
                    onQueryClear={() => setSearch("")}
                    filters={filters}
                    appliedFilters={appliedFilters}
                    onClearAll={() => {
                        setSearch("");
                        setTagFilter(null);
                    }}
                />

                {loading ? (
                    <div style={{ padding: 20 }}>
                        <Spinner />
                    </div>
                ) : (
                    <>
                        <IndexTable
                            resourceName={{ singular: "customer", plural: "customers" }}
                            itemCount={customers.length}
                            headings={[
                                { title: "Avatar" },
                                { title: "Name" },
                                { title: "Email" },
                                { title: "Phone" },
                                { title: "Actions" },
                            ]}
                            selectable={false}
                        >
                            {customerRows}
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
