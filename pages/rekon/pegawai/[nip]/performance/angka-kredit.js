import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import Head from "next/head";

const PerformanceAngkaKredit = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Angka Kredit</title>
      </Head>
      <PageContainer title="Rekon" content="Angka Kredit"></PageContainer>
    </>
  );
};

PerformanceAngkaKredit.getLayout = (page) => {
  return <RekonLayout active="/rekon/pegawai">{page}</RekonLayout>;
};

PerformanceAngkaKredit.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default PerformanceAngkaKredit;
