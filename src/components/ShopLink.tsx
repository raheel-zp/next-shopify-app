import Link from "next/link";
import type { UrlObject } from "url";
import type { ParsedUrlQuery } from "querystring";
import type { LinkProps } from "next/link";
import type { ReactNode } from "react";
import { useRouter } from "next/router";

interface ShopLinkProps extends Omit<LinkProps, "href"> {
    href: string | UrlObject;
    children: ReactNode;
}

export default function ShopLink({ href, children, ...props }: ShopLinkProps) {
    const router = useRouter();
    const shop = router.query.shop as string | undefined;

    let finalHref: string | UrlObject = href;

    if (typeof href === "string" && shop) {
        if (!href.startsWith("http") && !href.startsWith("/api")) {
            const hasQuery = href.includes("?");
            finalHref = hasQuery ? `${href}&shop=${shop}` : `${href}?shop=${shop}`;
        }
    } else if (typeof href === "object" && shop) {
        const query = href.query as ParsedUrlQuery | undefined;
        const newQuery: ParsedUrlQuery = { ...query, shop };
        finalHref = { ...href, query: newQuery };
    }

    return (
        <Link href={finalHref} {...props}>
            {children}
        </Link>
    );
}
