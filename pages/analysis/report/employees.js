import UnduhDataIPASN from "@/components/LayananSIASN/UnduhDataIPASN";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

function EmployeesReport() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Report - Report Pegawai SIASN</title>
      </Head>
      <PageContainer title="Download" subTitle="Unduh Data IP ASN">
        <UnduhDataIPASN />
      </PageContainer>
    </>
  );
}

EmployeesReport.getLayout = function getLayout(page) {
  return <Layout active="/analysis/report/employees">{page}</Layout>;
};

EmployeesReport.Auth = {
  action: "manage",
  subject: "Dashboard",
};

export default EmployeesReport;
