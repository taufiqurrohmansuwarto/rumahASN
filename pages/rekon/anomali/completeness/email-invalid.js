import EmailKosong from "@/components/Fasilitator/KualitasData/Completeness/EmailKosong";
import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Grid } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const CompletenessEmailInvalid = () => {
  const breakPoint = Grid.useBreakpoint();
  const router = useRouter();

  const gotoRekonAnomali = () => {
    router.push("/rekon/anomali");
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Kualitas Data - Email Kosong</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        onBack={gotoRekonAnomali}
        title="Dimensi Completeness - Email Kosong"
        content="Email kosong"
      >
        <EmailKosong />
      </PageContainer>
    </>
  );
};

CompletenessEmailInvalid.getLayout = (page) => {
  return <RekonLayout active="/rekon/anomali">{page}</RekonLayout>;
};

CompletenessEmailInvalid.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default CompletenessEmailInvalid;
