import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import Head from "next/head";

const RekonJft = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Rekon JFT</title>
      </Head>
      <PageContainer title="Rekon JFT">
        <div>Rekon JFT</div>
      </PageContainer>
    </>
  );
};

RekonJft.getLayout = (page) => {
  return <RekonLayout active="/rekon/rekon-jft">{page}</RekonLayout>;
};

RekonJft.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RekonJft;
