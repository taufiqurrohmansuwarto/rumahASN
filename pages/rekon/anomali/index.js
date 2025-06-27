import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import Head from "next/head";
import DetailKualitasData from "@/components/Fasilitator/KualitasData/DetailKualitasData";

const RekonAnomali = () => {
  useScrollRestoration();

  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Disparitas Data</title>
      </Head>
      <PageContainer
        title="Deteksi Anomali Data 🔍"
        content="Identifikasi dan analisis disparitas data antara sistem SIASN dan SIMASTER untuk memastikan konsistensi informasi kepegawaian"
      >
        <DetailKualitasData />
      </PageContainer>
    </>
  );
};

RekonAnomali.getLayout = (page) => {
  return <RekonLayout active="/rekon/anomali">{page}</RekonLayout>;
};

RekonAnomali.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RekonAnomali;
