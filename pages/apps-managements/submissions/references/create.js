import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import BuatKamusUsulan from "@/components/Usulan/BuatKamusUsulan";
import Head from "next/head";
import { useRouter } from "next/router";

const SubmissionCreate = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Submission Reference - Create</title>
      </Head>
      <PageContainer
        title="Buat Kamus Usulan"
        content="Kamus Usulan Baru"
        onBack={() => router.back()}
      >
        <BuatKamusUsulan />
      </PageContainer>
    </>
  );
};

SubmissionCreate.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

SubmissionCreate.getLayout = function getLayout(page) {
  return <Layout active="/apps-managements/submissions">{page}</Layout>;
};

export default SubmissionCreate;
