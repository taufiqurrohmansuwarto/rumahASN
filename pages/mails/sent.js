import Layout from "@/components/Layout";
import MailLayout from "@/components/MailLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

const SentMail = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Pribadi</title>
      </Head>
      <PageContainer>Hello world</PageContainer>
    </>
  );
};

SentMail.getLayout = function getLayout(page) {
  return (
    <Layout>
      <MailLayout active="sent">{page}</MailLayout>
    </Layout>
  );
};

SentMail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default SentMail;
