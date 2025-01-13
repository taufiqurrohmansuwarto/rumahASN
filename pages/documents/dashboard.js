import DocumentLayout from "@/components/Documents/DocumentLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

const DocumentDashboard = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Dokumen</title>
      </Head>
      <PageContainer>
        <div>index</div>
      </PageContainer>
    </>
  );
};

DocumentDashboard.getLayout = (page) => {
  return <DocumentLayout active="/documents/dashboard">{page}</DocumentLayout>;
};

DocumentDashboard.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default DocumentDashboard;
