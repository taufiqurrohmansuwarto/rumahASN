import MyMeetings from "@/components/CoachingClinic/Participant/MyMeetings";
import UpcomingMeetings from "@/components/CoachingClinic/Participant/UpcomingMeetings";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Card } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const CoachingClinic = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Rumah ASN - Coaching Clinic</title>
      </Head>
      <PageContainer
        title="Coaching Clinic"
        content="Daftar Coaching Clinic Saya"
      >
        <Card>
          <UpcomingMeetings />
          <MyMeetings />
        </Card>
      </PageContainer>
    </>
  );
};

CoachingClinic.Auth = {
  action: "manage",
  subject: "tickets",
};

CoachingClinic.getLayout = (page) => {
  return <Layout active="/coaching-clinic">{page}</Layout>;
};

export default CoachingClinic;
