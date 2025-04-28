import TingkatPendidikanEselonTidakMemenuhiSyarat from "@/components/Fasilitator/KualitasData/Accuracy/TingkatPendidikanEselonTidakMemenuhiSyarat";
import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Grid } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const AccuracyTingkatPendidikanEselonTidakMemenuhiSyarat = () => {
  const breakPoint = Grid.useBreakpoint();
  const router = useRouter();

  const gotoRekonAnomali = () => {
    router.push("/rekon/anomali");
  };

  return (
    <>
      <Head>
        <title>
          Rumah ASN - Kualitas Data - Tingkat Pendidikan Eselon Tidak Memenuhi
          Syarat
        </title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        onBack={gotoRekonAnomali}
        title="Dimensi Accuracy - Tingkat Pendidikan Eselon Tidak Memenuhi Syarat"
        content="Tingkat pendidikan eselon tidak memenuhi syarat"
      >
        <TingkatPendidikanEselonTidakMemenuhiSyarat />
      </PageContainer>
    </>
  );
};

AccuracyTingkatPendidikanEselonTidakMemenuhiSyarat.getLayout = (page) => {
  return <RekonLayout active="/rekon/anomali">{page}</RekonLayout>;
};

AccuracyTingkatPendidikanEselonTidakMemenuhiSyarat.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default AccuracyTingkatPendidikanEselonTidakMemenuhiSyarat;
