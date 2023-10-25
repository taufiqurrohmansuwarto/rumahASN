import CreateCoaching from "@/components/CoachingClinic/Consultant/CreateCoaching";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { SearchOutlined } from "@ant-design/icons";
import { Button, Empty } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const CoachingClinic = () => {
  const router = useRouter();

  const handleCreate = () => router.push("/coaching-clinic/consults");

  return (
    <>
      <Head>
        <title>Rumah ASN - Instruktur Coaching Clinic</title>
      </Head>
      <PageContainer title="Coaching Clinic" content="Jadwal Konsultasi Online">
        <CreateCoaching />
      </PageContainer>
    </>
  );
};

CoachingClinic.Auth = {
  action: "manage",
  subject: "tickets",
};

CoachingClinic.getLayout = (page) => {
  return <Layout active="/coaching-clinic-consultant">{page}</Layout>;
};

export default CoachingClinic;
