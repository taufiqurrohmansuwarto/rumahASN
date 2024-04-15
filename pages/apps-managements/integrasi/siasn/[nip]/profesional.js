import Layout from "@/components/Layout";
import EmployeesLayout from "@/components/PemutakhiranData/Admin/EmployeesLayout";
import Head from "next/head";
import { useRouter } from "next/router";

function Profesional() {
  const router = useRouter();
  const { nip } = router.query;

  return (
    <>
      <Head>
        <title>Integrasi MyASN - Profesional</title>
      </Head>
      <EmployeesLayout>
        <div>Profesional</div>
      </EmployeesLayout>
    </>
  );
}

Profesional.getLayout = function (page) {
  return <Layout>{page}</Layout>;
};

Profesional.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Profesional;
