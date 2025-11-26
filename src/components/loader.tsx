import {
    Page,
    Spinner,
} from "@shopify/polaris";
export default function Pageloader() {
    return (
        <Page>
            <div style={{ padding: 50, textAlign: "center" }}>
                <Spinner size="large" />
            </div>
        </Page>
    );
}