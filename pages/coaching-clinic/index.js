import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { SearchOutlined } from "@ant-design/icons";
import { Button, Calendar, Card } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import moment from "moment";

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
        <Button onClick={handleCreate} type="primary" icon={<SearchOutlined />}>
          Cari Coaching
        </Button>
        <Card>
          <Calendar dateCellRender={dateCellRender} mode="month" />
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
