import Layout from "@/components/Layout";
import EmployeesLayout from "@/components/PemutakhiranData/Admin/EmployeesLayout";
import Head from "next/head";
import { useRouter } from "next/router";

function PrestasiDisiplin() {
  const router = useRouter();
  const { nip } = router.query;

  return (
    <>
      <Head>
        <title>Integrasi MyASN - Prestasi & Disiplin</title>
      </Head>
      <EmployeesLayout>
        <div>Prestasi & Disiplin</div>
      </EmployeesLayout>
    </>
  );
}

PrestasiDisiplin.getLayout = function (page) {
  return <Layout>{page}</Layout>;
};

PrestasiDisiplin.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default PrestasiDisiplin;
