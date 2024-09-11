import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import { useRouter } from "next/router";
import UsulanPerencanaanDetailAdmin from "@/components/Perencanaan/UsulanPerencanaanDetailAdmin";

function PerencanaanUsulanDetail() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Detail Usulan Perencanaan</title>
      </Head>
      <PageContainer
        title="Usulan Formasi"
        onBack={() => router.back()}
        content="Detail Usulan Formasi"
      >
        <UsulanPerencanaanDetailAdmin />
      </PageContainer>
    </>
  );
}

PerencanaanUsulanDetail.getLayout = (page) => {
  return <Layout active="/apps-managements/perencanaan/usulan">{page}</Layout>;
};

PerencanaanUsulanDetail.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default PerencanaanUsulanDetail;
