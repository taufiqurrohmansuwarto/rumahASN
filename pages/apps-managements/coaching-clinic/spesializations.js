import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

const SpecializationCoachingClinic = () => {
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

SpecializationCoachingClinic.Auth = {
  action: "manage",
  subject: "tickets",
};

SpecializationCoachingClinic.getLayout = (page) => {
  return <Layout active="/coaching-clinic">{page}</Layout>;
};

export default SpecializationCoachingClinic;
