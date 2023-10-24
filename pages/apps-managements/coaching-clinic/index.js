import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

const SettingCoachingClinic = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Setting Coaching Clinic</title>
      </Head>
      <PageContainer title="Coaching Clinic" content="Setting Coaching Clinic">
        Hello world
      </PageContainer>
    </>
  );
};

SettingCoachingClinic.Auth = {
  action: "manage",
  subject: "tickets",
};

SettingCoachingClinic.getLayout = (page) => {
  return <Layout active="/coaching-clinic">{page}</Layout>;
};

export default SettingCoachingClinic;
