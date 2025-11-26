import { useRouter } from "next/router";
import type { UrlObject } from "url";
import type { ParsedUrlQuery } from "querystring";

type Url = string | UrlObject;

export function useShopRouter() {
    const router = useRouter();
    const shop = router.query.shop as string | undefined;

    function appendShop(url: Url): Url {
        if (!shop) return url;

        if (typeof url === "string") {
            if (url.startsWith("http") || url.startsWith("/api")) return url;
            const hasQuery = url.includes("?");
            return hasQuery ? `${url}&shop=${shop}` : `${url}?shop=${shop}`;
        }

        const query = url.query as ParsedUrlQuery | undefined;
        const newQuery: ParsedUrlQuery = { ...query, shop };

        return {
            ...url,
            query: newQuery,
        };
    }

    return {
        ...router,
        push: (
            url: Url,
            as?: Url,
            options?: Parameters<typeof router.push>[2]
        ) => router.push(appendShop(url), as, options),

        replace: (
            url: Url,
            as?: Url,
            options?: Parameters<typeof router.replace>[2]
        ) => router.replace(appendShop(url), as, options),
    };
}
