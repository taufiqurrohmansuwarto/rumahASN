import PendidikanJabatanFungsionalTidakMemenuhiSyarat from "@/components/Fasilitator/KualitasData/Accuracy/PendidikanJabatanFungsionalTidakMemenuhiSyarat";
import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Grid } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const AccuracyPendidikanJabatanFungsionalTidakMemenuhiSyarat = () => {
  const breakPoint = Grid.useBreakpoint();
  const router = useRouter();

  const gotoRekonAnomali = () => {
    router.push("/rekon/anomali");
  };

  return (
    <>
      <Head>
        <title>
          Rumah ASN - Kualitas Data - Pendidikan Jabatan Fungsional Tidak
          Memenuhi Syarat
        </title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        onBack={gotoRekonAnomali}
        title="Dimensi Accuracy - Pendidikan Jabatan Fungsional Tidak Memenuhi Syarat"
        content="Pendidikan jabatan fungsional tidak memenuhi syarat"
      >
        <PendidikanJabatanFungsionalTidakMemenuhiSyarat />
      </PageContainer>
    </>
  );
};

AccuracyPendidikanJabatanFungsionalTidakMemenuhiSyarat.getLayout = (page) => {
  return <RekonLayout active="/rekon/anomali">{page}</RekonLayout>;
};

AccuracyPendidikanJabatanFungsionalTidakMemenuhiSyarat.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default AccuracyPendidikanJabatanFungsionalTidakMemenuhiSyarat;
