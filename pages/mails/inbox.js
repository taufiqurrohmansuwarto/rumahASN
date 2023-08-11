import Layout from "@/components/Layout";
import MailLayout from "@/components/MailLayout";
import ListPrivateMessages from "@/components/PrivateMessages/ListPrivateMessages";
import { PageContainer } from "@ant-design/pro-layout";
import { Button } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const InboxMail = () => {
  const router = useRouter();
  const gotoCreate = () => router.push("/mails/create");

  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Pribadi</title>
      </Head>
      <PageContainer title="Inbox">
        <ListPrivateMessages type="inbox" />
        <Button onClick={gotoCreate}>Buat Pesan</Button>
      </PageContainer>
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
