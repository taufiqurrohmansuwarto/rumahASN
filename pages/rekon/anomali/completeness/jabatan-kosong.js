import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Grid } from "antd";
import Head from "next/head";
import JabatanKosong from "@/components/Fasilitator/KualitasData/Completeness/JabatanKosong";
import { useRouter } from "next/router";

const CompletenessJabatanKosong = () => {
  const breakPoint = Grid.useBreakpoint();
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Rumah ASN - Kualitas Data - Jabatan Kosong</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        onBack={() => router.back()}
        title="Dimensi Completeness - Jabatan Kosong"
        content="Jabatan kosong"
      >
        <JabatanKosong />
      </PageContainer>
    </>
  );
};

CompletenessJabatanKosong.getLayout = (page) => {
  return <RekonLayout active="/rekon/anomali">{page}</RekonLayout>;
};

CompletenessJabatanKosong.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default CompletenessJabatanKosong;
