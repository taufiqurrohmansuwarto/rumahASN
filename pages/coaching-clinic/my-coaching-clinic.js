import LayoutParticipant from "@/components/CoachingClinic/Participant/LayoutParticipant";
import MyMeetings from "@/components/CoachingClinic/Participant/MyMeetings";
import Layout from "@/components/Layout";
import { Card } from "antd";
import Head from "next/head";

const MyCoachingClinic = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Coaching Clinic</title>
      </Head>
      <LayoutParticipant
        content="Daftar Jadwal Coaching Clinic Saya"
        active="my-coaching-clinic"
      >
        <Card title="Daftar Coaching Clinic Saya">
          <MyMeetings />
        </Card>
      </LayoutParticipant>
    </>
  );
};

MyCoachingClinic.Auth = {
  action: "manage",
  subject: "tickets",
};

MyCoachingClinic.getLayout = (page) => {
  return <Layout active="/coaching-clinic/all">{page}</Layout>;
};

export default MyCoachingClinic;
