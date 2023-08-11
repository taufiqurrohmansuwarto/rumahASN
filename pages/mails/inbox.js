import Layout from "@/components/Layout";
import MailLayout from "@/components/MailLayout";
import { PageContainer } from "@ant-design/pro-layout";
import Head from "next/head";

const InboxMail = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Pribadi</title>
      </Head>
      <PageContainer>Hello world</PageContainer>
    </>
  );
};

InboxMail.getLayout = function getLayout(page) {
  return (
    <Layout>
      <MailLayout active="inbox">{page}</MailLayout>
    </Layout>
  );
};

InboxMail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default InboxMail;
