import GelarKosong from "@/components/Fasilitator/KualitasData/Completeness/GelarKosong";
import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Grid } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const CompletenessGelarKosong = () => {
  const breakPoint = Grid.useBreakpoint();
  const router = useRouter();

  const gotoRekonAnomali = () => {
    router.push("/rekon/anomali");
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Kualitas Data - Gelar Kosong</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        onBack={gotoRekonAnomali}
        title="Dimensi Completeness - Gelar Kosong"
        content="Gelar kosong"
      >
        <GelarKosong />
      </PageContainer>
    </>
  );
};

CompletenessGelarKosong.getLayout = (page) => {
  return <RekonLayout active="/rekon/anomali">{page}</RekonLayout>;
};

CompletenessGelarKosong.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default CompletenessGelarKosong;
