import TmtPnsKosong from "@/components/Fasilitator/KualitasData/Completeness/TMTPNSKosong";
import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Grid } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const CompletenessTmtPnsKosong = () => {
  const breakPoint = Grid.useBreakpoint();
  const router = useRouter();

  const gotoRekonAnomali = () => {
    router.push("/rekon/anomali");
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Kualitas Data - TMT PNS Kosong</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        onBack={gotoRekonAnomali}
        title="Dimensi Completeness - TMT PNS Kosong"
        content="TMT PNS kosong"
      >
        <TmtPnsKosong />
      </PageContainer>
    </>
  );
};

CompletenessTmtPnsKosong.getLayout = (page) => {
  return <RekonLayout active="/rekon/anomali">{page}</RekonLayout>;
};

CompletenessTmtPnsKosong.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default CompletenessTmtPnsKosong;
