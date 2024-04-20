import Layout from "@/components/Layout";
import EmployeesLayout from "@/components/PemutakhiranData/Admin/EmployeesLayout";
import ContentProfesional from "@/components/PemutakhiranData/Admin/Menu/ContentProfesional";
import { FloatButton } from "antd";
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
      <FloatButton.BackTop />
      <EmployeesLayout active="profesional">
        <ContentProfesional nip={nip} />
      </EmployeesLayout>
    </>
  );
}

Profesional.getLayout = function (page) {
  return <Layout active="/apps-managements/integrasi/siasn">{page}</Layout>;
};

Profesional.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Profesional;
