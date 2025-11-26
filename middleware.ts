// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export const runtime = "nodejs";
export async function middleware(req: NextRequest) {
    const { pathname, searchParams } = req.nextUrl;

    // skip non-app pages
    if (pathname.startsWith("/api") || pathname === "/" || pathname.startsWith("/auth") || pathname.startsWith("/billing")) {
        return NextResponse.next();
    }

    const shop = searchParams.get("shop");
    if (!shop) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    try {
        const response = await fetch(`${req.nextUrl.origin}/api/billingStatus?shop=${shop}`);
        const data = await response.json();

        if (!data.status) {
            return NextResponse.redirect(new URL(`/billing?shop=${shop}`, req.url));
        }
    } catch (err) {
        console.error("Billing check failed:", err);
        return NextResponse.redirect(new URL("/", req.url));
    }

    console.log("✅ Middleware executed for", pathname, "shop:", shop);
    return NextResponse.next();
}

export const config = {
    matcher: "/:path*",
};