import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import KamusUsulanFile from "@/components/Usulan/KamusUsulanFile";

const SubmissionsFiles = () => {
  return (
    <>
      <Head>
        <title>Submission Reference</title>
      </Head>
      <PageContainer title="File Usulan" content="File Usulan ASN">
        <KamusUsulanFile />
      </PageContainer>
    </>
  );
};

SubmissionsFiles.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

SubmissionsFiles.getLayout = function getLayout(page) {
  return <Layout active="/apps-managements/submissions/files">{page}</Layout>;
};

export default SubmissionsFiles;
