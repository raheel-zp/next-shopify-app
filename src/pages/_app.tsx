// pages/_app.tsx

import type { AppProps } from 'next/app';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import enTranslations from '@shopify/polaris/locales/en.json';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';

function MyApp({ Component, pageProps }: AppProps) {

  const config = {
    apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || "",
    host: process.env.NEXT_PUBLIC_HOST || "",
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
