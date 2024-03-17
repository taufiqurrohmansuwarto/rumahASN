import ReportIPASN from "@/components/LayananSIASN/ReportIPASN";
import UnduhDataIPASN from "@/components/LayananSIASN/UnduhDataIPASN";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

function IPASNReport() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Report - Report Pegawai SIASN</title>
      </Head>
      <PageContainer
        title="Report"
        subTitle="IP ASN Pemerintah Provinsi Jawa Timur"
        content="Report IP ASN"
      >
        <ReportIPASN />
      </PageContainer>
    </>
  );
}

IPASNReport.getLayout = function getLayout(page) {
  return <Layout active="/analysis/report/ip-asn">{page}</Layout>;
};

IPASNReport.Auth = {
  action: "manage",
  subject: "Dashboard",
};

export default IPASNReport;
