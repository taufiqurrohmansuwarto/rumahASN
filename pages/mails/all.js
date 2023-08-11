import Layout from "@/components/Layout";
import MailLayout from "@/components/MailLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

const AllMail = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Pribadi</title>
      </Head>
      <PageContainer>Hello world</PageContainer>
    </>
  );
};

AllMail.getLayout = function getLayout(page) {
  return (
    <Layout>
      <MailLayout active="all">{page}</MailLayout>
    </Layout>
  );
};

AllMail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default AllMail;
