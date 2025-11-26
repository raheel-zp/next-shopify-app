// pages/_app.tsx

import type { AppProps } from 'next/app';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import enTranslations from '@shopify/polaris/locales/en.json';
import { useShopRouter } from "../utils/useShopRouter";

function MyApp({ Component, pageProps }: AppProps) {
  useShopRouter();
  return (
    <AppProvider i18n={enTranslations}>
      <Component {...pageProps} />
    </AppProvider>
  );
}

export default MyApp;
