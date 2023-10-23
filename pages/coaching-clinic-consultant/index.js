import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { SearchOutlined } from "@ant-design/icons";
import { Button } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const CoachingClinic = () => {
  const router = useRouter();

  const handleCreate = () => router.push("/coaching-clinic/consults");

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
