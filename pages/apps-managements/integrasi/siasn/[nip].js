import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import SiasnTab from "@/components/PemutakhiranData/Admin/SiasnTab";
import Head from "next/head";
import { useRouter } from "next/router";

const IntegrasiSIASNByNIP = () => {
  const router = useRouter();
  const { nip } = router?.query;

  return (
    <>
      <Head>
        <title>Data SIASN - SIMASTER {nip}</title>
      </Head>
      <PageContainer
        onBack={() => router.back()}
        title="Data Integrasi SIASN"
        subTitle={`Integrasi SIASN - SIMASTER ${nip}`}
      >
        <SiasnTab nip={nip} />
      </PageContainer>
    </>
  );
};

IntegrasiSIASNByNIP.getLayout = function (page) {
  return <Layout>{page}</Layout>;
};

IntegrasiSIASNByNIP.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default IntegrasiSIASNByNIP;
