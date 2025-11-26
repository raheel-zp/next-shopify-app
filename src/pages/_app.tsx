// src/pages/_app.tsx
import type { AppProps } from "next/app";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import enTranslations from "@shopify/polaris/locales/en.json";
import { ShopProvider } from "@/context/ShopContext";

function MyApp({ Component, pageProps }: AppProps & { pageProps: { shop?: string } }) {
  const shopFromCookie = typeof window !== "undefined"
    ? document.cookie.split("; ").find(c => c.startsWith("shop="))?.split("=")[1]
    : undefined;
  return (
    <ShopProvider initialShop={pageProps.shop || shopFromCookie}>
      <AppProvider i18n={enTranslations}>
        <Component {...pageProps} />
      </AppProvider>
    </ShopProvider>
  );
}

export default MyApp;
