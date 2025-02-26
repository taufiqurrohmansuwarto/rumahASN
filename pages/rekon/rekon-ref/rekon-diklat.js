import Head from "next/head";
import PageContainer from "@/components/PageContainer";
import RekonUnorSIASN from "@/components/Rekon/RekonUnorSIASN";
import RekonLayout from "@/components/Rekon/RekonLayout";

const RekonDiklat = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Rekon Diklat</title>
      </Head>
      <PageContainer title="Rekon" content="Kamus Diklat">
        <div>Rekon Diklat</div>
      </PageContainer>
    </>
  );
};

RekonDiklat.getLayout = (page) => {
  return <RekonLayout active="/rekon/rekon-diklat">{page}</RekonLayout>;
};

RekonDiklat.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RekonDiklat;
