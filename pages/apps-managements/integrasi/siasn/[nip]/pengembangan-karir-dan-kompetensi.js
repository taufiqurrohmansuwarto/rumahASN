import Layout from "@/components/Layout";
import EmployeesLayout from "@/components/PemutakhiranData/Admin/EmployeesLayout";
import Head from "next/head";
import { useRouter } from "next/router";

function PengembanganKarirDanKompetensi() {
  const router = useRouter();
  const { nip } = router.query;

  return (
    <>
      <Head>
        <title>Integrasi MyASN - Pengembangan Karir dan Kompetensi</title>
      </Head>
      <EmployeesLayout active="pengembangan-karir-dan-kompetensi">
        <div>Pengembangan Karir dan Kompetensi</div>
      </EmployeesLayout>
    </>
  );
}

PengembanganKarirDanKompetensi.getLayout = function (page) {
  return <Layout active="/apps-managements/integrasi/siasn">{page}</Layout>;
};

PengembanganKarirDanKompetensi.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default PengembanganKarirDanKompetensi;
