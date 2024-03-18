import ReportEmployees from "@/components/LayananSIASN/ReportEmployees";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

function EmployeesReport() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Report - Report Pegawai SIASN</title>
      </Head>
      <PageContainer title="Download" subTitle="Data Semua SIASN">
        <ReportEmployees />
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
