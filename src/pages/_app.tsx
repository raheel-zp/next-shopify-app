// pages/_app.tsx

import type { AppProps } from 'next/app';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import enTranslations from '@shopify/polaris/locales/en.json';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppProvider i18n={enTranslations}>
      <Component {...pageProps} />
    </AppProvider>
  );
}

export default MyApp;
