// pages/_app.tsx

import type { AppProps } from 'next/app';
import { Provider as AppBridgeProvider } from "@shopify/app-bridge-react";
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import enTranslations from '@shopify/polaris/locales/en.json';

function MyApp({ Component, pageProps }: AppProps) {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || "",
    host: typeof window !== "undefined" ? window.location.hostname : "",
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
