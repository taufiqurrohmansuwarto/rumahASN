import DocumentLayout from "@/components/Documents/DocumentLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import WebinarSigner from "@/components/Documents/WebinarSigner";
import { Grid } from "antd";
const DocumentTteWebinar = () => {
  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Rumah ASN - Dokumen</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        title="TTE Webinar"
        content="TTE Webinar"
      >
        <WebinarSigner />
      </PageContainer>
    </>
  );
};

DocumentTteWebinar.getLayout = (page) => {
  return (
    <DocumentLayout active="/documents/tte-webinar">{page}</DocumentLayout>
  );
};

DocumentTteWebinar.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default DocumentTteWebinar;
