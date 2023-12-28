import MyMeetings from "@/components/CoachingClinic/Participant/MyMeetings";
import UpcomingMeetings from "@/components/CoachingClinic/Participant/UpcomingMeetings";
import Layout from "@/components/Layout";
import LayoutAsnConnect from "@/components/LayoutASNConnect";
import PageContainer from "@/components/PageContainer";
import { Card } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const AsnUpdates = () => {
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
        <Card></Card>
      </PageContainer>
    </>
  );
};

AsnUpdates.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnUpdates.getLayout = (page) => {
  return <LayoutAsnConnect active="/coaching-clinic">{page}</LayoutAsnConnect>;
};

export default AsnUpdates;
