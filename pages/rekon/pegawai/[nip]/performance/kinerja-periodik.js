import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import Head from "next/head";

const PerformanceKinerjaPeriodik = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Kinerja Periodik</title>
      </Head>
      <PageContainer title="Rekon" content="Kinerja Periodik"></PageContainer>
    </>
  );
};

PerformanceKinerjaPeriodik.getLayout = (page) => {
  return <RekonLayout active="/rekon/pegawai">{page}</RekonLayout>;
};

PerformanceKinerjaPeriodik.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default PerformanceKinerjaPeriodik;
