import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { SearchOutlined } from "@ant-design/icons";
import { Button, Calendar, Card } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import moment from "moment";
import UpcomingMeetings from "@/components/CoachingClinic/Participant/UpcomingMeetings";
import MyMeetings from "@/components/CoachingClinic/Participant/MyMeetings";

const CoachingClinic = () => {
  const router = useRouter();

  const handleCreate = () => router.push("/coaching-clinic/consults");

  const dateCellRender = (value) => {
    // every sunday in this month

    const isSunday = moment(value).day() === 0;

    if (isSunday) {
      return (
        <div className="text-center">
          <div className="text-2xl">12</div>
          <div className="text-sm">Minggu</div>
        </div>
      );
    }
  };

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
