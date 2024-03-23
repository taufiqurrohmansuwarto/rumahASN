import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import DetailKamusUsulan from "@/components/Usulan/DetailKamusUsulan";
import Head from "next/head";

const SubmissionReferenceDetail = () => {
  return (
    <>
      <Head>
        <title>Submission Reference</title>
      </Head>
      <PageContainer
        title="Detail Kamus Usulan"
        content="Detail Kamus Usulan ASN"
      >
        <DetailKamusUsulan />
      </PageContainer>
    </>
  );
};

SubmissionReferenceDetail.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

SubmissionReferenceDetail.getLayout = function getLayout(page) {
  return <Layout active="/apps-managements/submissions">{page}</Layout>;
};

export default SubmissionReferenceDetail;
