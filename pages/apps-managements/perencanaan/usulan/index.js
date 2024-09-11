import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import UsulanPerencanaan from "@/components/Perencanaan/UsulanPerencanaan";
import Head from "next/head";

function PerencanaanUsulan() {
  return (
    <>
      <Head>
        <title>Usulan Formasi</title>
      </Head>
      <PageContainer title="Perencanaan" subTitle="Usulan Formasi">
        <UsulanPerencanaan />
      </PageContainer>
    </>
  );
}

PerencanaanUsulan.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

PerencanaanUsulan.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default PerencanaanUsulan;
