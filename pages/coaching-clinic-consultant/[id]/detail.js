import DetailCoachingMeeting from "@/components/CoachingClinic/Consultant/DetailCoachingMeeting";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

const DetailCoachingClinic = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Instruktur Coaching Clinic</title>
      </Head>
      <PageContainer title="Coaching Clinic" content="Jadwal Konsultasi Online">
        <DetailCoachingMeeting />
      </PageContainer>
    </>
  );
};

DetailCoachingClinic.Auth = {
  action: "manage",
  subject: "tickets",
};

DetailCoachingClinic.getLayout = (page) => {
  return <Layout active="/coaching-clinic-consultant">{page}</Layout>;
};

export default DetailCoachingClinic;
