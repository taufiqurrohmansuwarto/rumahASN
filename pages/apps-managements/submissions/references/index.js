import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import KamusUsulan from "@/components/Usulan/KamusUsulan";
import Head from "next/head";

const SubmissionReference = () => {
  return (
    <>
      <Head>
        <title>Submission Reference</title>
      </Head>
      <PageContainer title="Kamus Usulan" content="Kamus Usulan ASN">
        <KamusUsulan />
      </PageContainer>
    </>
  );
};

SubmissionReference.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

SubmissionReference.getLayout = function getLayout(page) {
  return (
    <Layout active="/apps-managements/submissions/references">{page}</Layout>
  );
};

export default SubmissionReference;
