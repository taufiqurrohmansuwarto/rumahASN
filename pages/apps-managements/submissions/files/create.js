import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import FormKamusUsulanFile from "@/components/Usulan/FormKamusUsulanFile";
import Head from "next/head";
import { useRouter } from "next/router";

const SubmissionCreate = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Submission Reference - File Usulan</title>
      </Head>
      <PageContainer
        title="Buat File Usulan"
        content="File Usulan Baru"
        onBack={() => router.back()}
      >
        <FormKamusUsulanFile />
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
