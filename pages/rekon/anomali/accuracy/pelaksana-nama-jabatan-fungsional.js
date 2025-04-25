import PelaksanaNamaJabatanFungsional from "@/components/Fasilitator/KualitasData/Accuracy/PelaksanaNamaJabatanFungsional";
import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Grid } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const AccuracyPelaksanaNamaJabatanFungsional = () => {
  const breakPoint = Grid.useBreakpoint();
  const router = useRouter();

  const gotoRekonAnomali = () => {
    router.push("/rekon/anomali");
  };

  return (
    <>
      <Head>
        <title>
          Rumah ASN - Kualitas Data - Pelaksana Nama Jabatan Fungsional
        </title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        onBack={gotoRekonAnomali}
        title="Dimensi Accuracy - Pelaksana Nama Jabatan Fungsional"
        content="Pelaksana nama jabatan fungsional"
      >
        <PelaksanaNamaJabatanFungsional />
      </PageContainer>
    </>
  );
};

AccuracyPelaksanaNamaJabatanFungsional.getLayout = (page) => {
  return <RekonLayout active="/rekon/anomali">{page}</RekonLayout>;
};

AccuracyPelaksanaNamaJabatanFungsional.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default AccuracyPelaksanaNamaJabatanFungsional;
