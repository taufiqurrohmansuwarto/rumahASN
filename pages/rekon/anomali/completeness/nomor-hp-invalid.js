import NoHpKosong from "@/components/Fasilitator/KualitasData/Completeness/NoHPKosong";
import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Grid } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const CompletenessNoHpKosong = () => {
  const breakPoint = Grid.useBreakpoint();
  const router = useRouter();

  const gotoRekonAnomali = () => {
    router.push("/rekon/anomali");
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Kualitas Data - No HP Kosong</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        onBack={gotoRekonAnomali}
        title="Dimensi Completeness - No HP Kosong"
        content="No HP kosong"
      >
        <NoHpKosong />
      </PageContainer>
    </>
  );
};

CompletenessNoHpKosong.getLayout = (page) => {
  return <RekonLayout active="/rekon/anomali">{page}</RekonLayout>;
};

CompletenessNoHpKosong.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default CompletenessNoHpKosong;
