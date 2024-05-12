import Layout from "@/components/Layout";
import CompareDataUtamaByNip from "@/components/PemutakhiranData/Admin/CompareDataUtamaByNip";
import EmployeesLayout from "@/components/PemutakhiranData/Admin/EmployeesLayout";
import { FloatButton } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

function DataUtama() {
  const router = useRouter();
  const { nip } = router.query;

  return (
    <>
      <Head>
        <title>Integrasi MyASN - Data Utama</title>
      </Head>
      <EmployeesLayout active="data-utama">
        {/* <CompareDataUtamaByNip nip={nip} /> */}
        {/* <FloatButton.BackTop /> */}
      </EmployeesLayout>
    </>
  );
}

DataUtama.getLayout = function (page) {
  return <Layout active="/apps-managements/integrasi/siasn">{page}</Layout>;
};

DataUtama.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default DataUtama;
