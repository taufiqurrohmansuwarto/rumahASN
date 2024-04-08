import ReportEmployees from "@/components/LayananSIASN/ReportEmployees";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Card } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

function EmployeesReport() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Rumah ASN - Report - Report Pegawai SIASN</title>
      </Head>
      <PageContainer
        onBack={() => router.back()}
        title="Download"
        subTitle="Data Semua SIASN"
        content="Download data pegawai SIASN dalam format Excel atau PDF."
      >
        <Card>
          <ReportEmployees />
        </Card>
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
