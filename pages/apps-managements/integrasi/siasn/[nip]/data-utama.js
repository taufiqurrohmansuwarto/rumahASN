import Layout from "@/components/Layout";
import CompareDataUtamaByNip from "@/components/PemutakhiranData/Admin/CompareDataUtamaByNip";
import EmployeesLayout from "@/components/PemutakhiranData/Admin/EmployeesLayout";
import Head from "next/head";
import { useRouter } from "next/router";

function DataUtama() {
  const router = useRouter();
  const { nip } = router.query;

  return (
    <>
      <Head>
        <title>Data Utama - Pemutakhiran Data</title>
      </Head>
      <EmployeesLayout>
        <CompareDataUtamaByNip nip={nip} />
      </EmployeesLayout>
    </>
  );
}

DataUtama.getLayout = function (page) {
  return <Layout>{page}</Layout>;
};

DataUtama.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default DataUtama;
