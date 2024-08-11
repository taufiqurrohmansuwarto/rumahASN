import LayoutParticipant from "@/components/CoachingClinic/Participant/LayoutParticipant";
import SearchCochingClinicByCode from "@/components/CoachingClinic/Participant/SearchCochingClinicByCode";
import UpcomingMeetings from "@/components/CoachingClinic/Participant/UpcomingMeetings";
import Layout from "@/components/Layout";
import { Stack } from "@mantine/core";
import { Card, Space } from "antd";
import Head from "next/head";

const CoachingClinic = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Coaching Clinic</title>
      </Head>
      <LayoutParticipant content="Jadwal Coaching & Mentoring" active="all">
        <Card>
          <Space direction="vertical">
            <SearchCochingClinicByCode />
            <UpcomingMeetings />
          </Space>
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
