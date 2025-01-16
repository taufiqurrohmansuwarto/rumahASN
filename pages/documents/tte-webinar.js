import DocumentLayout from "@/components/Documents/DocumentLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import SignTest from "@/components/Documents/SignTest";

const DocumentTteWebinar = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Dokumen</title>
      </Head>
      <PageContainer title="TTE Webinar" content="TTE Webinar">
        <SignTest />
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
