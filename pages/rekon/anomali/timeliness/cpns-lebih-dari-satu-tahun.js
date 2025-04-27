import CPNSLebih1Tahun from "@/components/Fasilitator/KualitasData/Timeliness/CPNSLebih1Tahun";
import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Grid } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const TimelinessCpnsLebihDariSatuTahun = () => {
  const breakPoint = Grid.useBreakpoint();
  const router = useRouter();

  const gotoRekonAnomali = () => {
    router.push("/rekon/anomali");
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Kualitas Data - Jenis Kelamin Pada ASN</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        onBack={gotoRekonAnomali}
        title="Dimensi Consistency - Jenis Kelamin Pada ASN"
        content="Jenis Kelamin Pada ASN"
      >
        <CPNSLebih1Tahun />
      </PageContainer>
    </>
  );
};

TimelinessCpnsLebihDariSatuTahun.getLayout = (page) => {
  return <RekonLayout active="/rekon/anomali">{page}</RekonLayout>;
};

TimelinessCpnsLebihDariSatuTahun.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default TimelinessCpnsLebihDariSatuTahun;
