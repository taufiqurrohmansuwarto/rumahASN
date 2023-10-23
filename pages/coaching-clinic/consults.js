import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

const Consults = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Coaching Clinic</title>
      </Head>
      <PageContainer
        title="Coaching Clinic"
        content="Daftar Coaching"
      ></PageContainer>
    </>
  );
};

Consults.Auth = {
  action: "manage",
  subject: "tickets",
};

Consults.getLayout = (page) => {
  return <Layout active="/coaching-clinic">{page}</Layout>;
};

export default Consults;
