// src/pages/_app.tsx
import type { AppProps } from "next/app";
import { AppProvider } from "@shopify/polaris";
import '@shopify/polaris/build/esm/styles.css';
import enTranslations from '@shopify/polaris/locales/en.json';
import { withBillingGuard } from "@/components/withBillingGuard";

const ProtectedApp = withBillingGuard((props: AppProps) => {
  const { Component, pageProps } = props;
  return <Component {...pageProps} />;
});

export default function MyApp(props: AppProps) {
  return (
    <AppProvider i18n={enTranslations}>
      <ProtectedApp {...props} />
    </AppProvider>
  );
}
