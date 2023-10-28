import LayoutParticipant from "@/components/CoachingClinic/Participant/LayoutParticipant";
import UpcomingMeetings from "@/components/CoachingClinic/Participant/UpcomingMeetings";
import Layout from "@/components/Layout";
import { Card } from "antd";
import Head from "next/head";

const CoachingClinic = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Coaching Clinic</title>
      </Head>
      <LayoutParticipant content="Daftar Jadwal Coaching Clinic" active="all">
        <Card>
          <UpcomingMeetings />
        </Card>
      </LayoutParticipant>
    </>
  );
};

CoachingClinic.Auth = {
  action: "manage",
  subject: "tickets",
};

CoachingClinic.getLayout = (page) => {
  return <Layout active="/coaching-clinic/all">{page}</Layout>;
};

export default CoachingClinic;
