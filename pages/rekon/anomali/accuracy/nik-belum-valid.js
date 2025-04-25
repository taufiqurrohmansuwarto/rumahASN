import NikBelumValid from "@/components/Fasilitator/KualitasData/Accuracy/NikBelumValid";
import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Grid } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const AccuracyNikBelumValid = () => {
  const breakPoint = Grid.useBreakpoint();
  const router = useRouter();

  const gotoRekonAnomali = () => {
    router.push("/rekon/anomali");
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Kualitas Data - NIK Belum Valid</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        onBack={gotoRekonAnomali}
        title="Dimensi Accuracy - NIK Belum Valid"
        content="NIK belum valid"
      >
        <NikBelumValid />
      </PageContainer>
    </>
  );
};

AccuracyNikBelumValid.getLayout = (page) => {
  return <RekonLayout active="/rekon/anomali">{page}</RekonLayout>;
};

AccuracyNikBelumValid.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default AccuracyNikBelumValid;
