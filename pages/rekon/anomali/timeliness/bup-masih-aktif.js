import BupMasihAktif from "@/components/Fasilitator/KualitasData/Timeliness/BupMasihAktif";
import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Grid } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const TimelinessBupMasihAktif = () => {
  const breakPoint = Grid.useBreakpoint();
  const router = useRouter();

  const gotoRekonAnomali = () => {
    router.push("/rekon/anomali");
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Kualitas Data - BUP Masih Aktif</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        onBack={gotoRekonAnomali}
        title="Dimensi Timeliness - BUP Masih Aktif"
        content="BUP Masih Aktif"
      >
        <BupMasihAktif />
      </PageContainer>
    </>
  );
};

TimelinessBupMasihAktif.getLayout = (page) => {
  return <RekonLayout active="/rekon/anomali">{page}</RekonLayout>;
};

TimelinessBupMasihAktif.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default TimelinessBupMasihAktif;
