import StrukturalGanda from "@/components/Fasilitator/KualitasData/Timeliness/StrukturalGanda";
import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Grid } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const TimelinessStrukturalGanda = () => {
  const breakPoint = Grid.useBreakpoint();
  const router = useRouter();

  const gotoRekonAnomali = () => {
    router.push("/rekon/anomali");
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Kualitas Data - Struktural Ganda</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        onBack={gotoRekonAnomali}
        title="Dimensi Timeliness - Struktural Ganda"
        content="Struktural Ganda"
      >
        <StrukturalGanda />
      </PageContainer>
    </>
  );
};

TimelinessStrukturalGanda.getLayout = (page) => {
  return <RekonLayout active="/rekon/anomali">{page}</RekonLayout>;
};

TimelinessStrukturalGanda.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default TimelinessStrukturalGanda;
