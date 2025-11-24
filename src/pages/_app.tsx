// pages/_app.tsx

import type { AppProps } from 'next/app';
import { Provider as AppBridgeProvider } from "@shopify/app-bridge-react";
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import enTranslations from '@shopify/polaris/locales/en.json';

function MyApp({ Component, pageProps }: AppProps) {
  let host = "";

  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    host = params.get("host") || "";
  }

  const config = {
    apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || "",
    host,
    forceRedirect: true,
  };
  return (
    <AppBridgeProvider config={config}>
      <AppProvider i18n={enTranslations}>
        <Component {...pageProps} />
      </AppProvider>
    </AppBridgeProvider>
  );
}

export default MyApp;
