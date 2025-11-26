// src/components/withBillingGuard.tsx
import { useEffect, useState, ComponentType } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const PUBLIC_PATHS = ["/", "/billing", "/auth"];

export function withBillingGuard<P extends object>(WrappedComponent: ComponentType<P>) {
    const ComponentWithGuard = (props: P) => {
        const router = useRouter();
        const [loading, setLoading] = useState(true);
        const [billingActive, setBillingActive] = useState(false);

        useEffect(() => {
            const checkBilling = async () => {
                if (!router.isReady) return;
                // Skip public pages
                if (PUBLIC_PATHS.includes(router.pathname)) {
                    setLoading(false);
                    return;
                }

                const shop = router.query.shop as string;
                if (!shop) {
                    router.replace("/billing");
                    return;
                }

                try {
                    const res = await axios.get<{ status: boolean }>(`/api/billingStatus?shop=${shop}`);
                    if (!res.data.status) {
                        router.replace(`/billing?shop=${shop}`);
                    } else {
                        setBillingActive(true);
                    }
                } catch (err) {
                    console.error("Billing check failed:", err);
                    router.replace("/billing");
                } finally {
                    setLoading(false);
                }
            };

            checkBilling();
        }, [router]);

        if (loading) {
            return <div style={{ padding: 40 }}>Loading...</div>;
        }

        // Only render wrapped component when billing is active or page is public
        if (PUBLIC_PATHS.includes(router.pathname) || billingActive) {
            return <WrappedComponent {...props} />;
        }

        return null;
    };

    return ComponentWithGuard;
}
