import TglLahirNipASN from "@/components/Fasilitator/KualitasData/Consistency/TglLahirNipASN";
import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Grid } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const ConsistencyTglLahirNipASN = () => {
  const breakPoint = Grid.useBreakpoint();
  const router = useRouter();

  const gotoRekonAnomali = () => {
    router.push("/rekon/anomali");
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Kualitas Data - Tgl Lahir NIP ASN</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        onBack={gotoRekonAnomali}
        title="Dimensi Consistency - Tgl Lahir NIP ASN"
        content="Tgl Lahir NIP ASN"
      >
        <TglLahirNipASN />
      </PageContainer>
    </>
  );
};

ConsistencyTglLahirNipASN.getLayout = (page) => {
  return <RekonLayout active="/rekon/anomali">{page}</RekonLayout>;
};

ConsistencyTglLahirNipASN.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default ConsistencyTglLahirNipASN;
