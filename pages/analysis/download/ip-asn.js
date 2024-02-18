import UnduhDataIPASN from "@/components/LayananSIASN/UnduhDataIPASN";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

function DownloadIPAsn() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Analisis - Dashboard</title>
      </Head>
      <PageContainer title="Download" subTitle="Unduh Data IP ASN">
        <UnduhDataIPASN />
      </PageContainer>
    </>
  );
}

DownloadIPAsn.getLayout = function getLayout(page) {
  return <Layout active="/analysis/dashboard">{page}</Layout>;
};

DownloadIPAsn.Auth = {
  action: "manage",
  subject: "Dashboard",
};

export default DownloadIPAsn;
