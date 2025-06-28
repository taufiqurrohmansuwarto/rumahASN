import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import Head from "next/head";

const PerformanceSKP = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - SKP</title>
      </Head>
      <PageContainer title="Rekon" content="SKP"></PageContainer>
    </>
  );
};

PerformanceSKP.getLayout = (page) => {
  return <RekonLayout active="/rekon/pegawai">{page}</RekonLayout>;
};

PerformanceSKP.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default PerformanceSKP;
