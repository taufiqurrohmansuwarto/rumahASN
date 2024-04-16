import Layout from "@/components/Layout";
import EmployeesLayout from "@/components/PemutakhiranData/Admin/EmployeesLayout";
import ContentPrestasiDanDisiplin from "@/components/PemutakhiranData/Admin/Menu/ContenPrestasiDanDisiplin";
import Head from "next/head";
import { useRouter } from "next/router";

function PrestasiDanDisiplin() {
  const router = useRouter();
  const { nip } = router.query;

  return (
    <>
      <Head>
        <title>Integrasi MyASN - Prestasi & Disiplin</title>
      </Head>
      <EmployeesLayout active="prestasi-dan-disiplin">
        <ContentPrestasiDanDisiplin nip={nip} />
      </EmployeesLayout>
    </>
  );
}

PrestasiDanDisiplin.getLayout = function (page) {
  return <Layout active="/apps-managements/integrasi/siasn">{page}</Layout>;
};

PrestasiDanDisiplin.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default PrestasiDanDisiplin;
