import MasaKerjaKurangDari2TahunStruktural from "@/components/Fasilitator/KualitasData/Accuracy/MasaKerjaKurangDari2TahunStruktural";
import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Grid } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const AccuracyMasaKerjaKurangDari2TahunStruktural = () => {
  const breakPoint = Grid.useBreakpoint();
  const router = useRouter();

  const gotoRekonAnomali = () => {
    router.push("/rekon/anomali");
  };

  return (
    <>
      <Head>
        <title>
          Rumah ASN - Kualitas Data - Masa Kerja Kurang Dari 2 Tahun Struktural
        </title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        onBack={gotoRekonAnomali}
        title="Dimensi Accuracy - Masa Kerja Kurang Dari 2 Tahun Struktural"
        content="Masa kerja kurang dari 2 tahun struktural"
      >
        <MasaKerjaKurangDari2TahunStruktural />
      </PageContainer>
    </>
  );
};

AccuracyMasaKerjaKurangDari2TahunStruktural.getLayout = (page) => {
  return <RekonLayout active="/rekon/anomali">{page}</RekonLayout>;
};

AccuracyMasaKerjaKurangDari2TahunStruktural.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default AccuracyMasaKerjaKurangDari2TahunStruktural;
