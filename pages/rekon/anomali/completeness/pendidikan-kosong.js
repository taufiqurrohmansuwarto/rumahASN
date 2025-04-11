import PendidikanKosong from "@/components/Fasilitator/KualitasData/Completeness/PendidikanKosong";
import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Grid } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const CompletenessPendidikanKosong = () => {
  const breakPoint = Grid.useBreakpoint();
  const router = useRouter();

  const gotoRekonAnomali = () => {
    router.push("/rekon/anomali");
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Kualitas Data - Pendidikan Kosong</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        onBack={gotoRekonAnomali}
        title="Dimensi Completeness - Pendidikan Kosong"
        content="Pendidikan kosong"
      >
        <PendidikanKosong />
      </PageContainer>
    </>
  );
};

CompletenessPendidikanKosong.getLayout = (page) => {
  return <RekonLayout active="/rekon/anomali">{page}</RekonLayout>;
};

CompletenessPendidikanKosong.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default CompletenessPendidikanKosong;
