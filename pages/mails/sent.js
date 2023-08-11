import Layout from "@/components/Layout";
import MailLayout from "@/components/MailLayout";
import PageContainer from "@/components/PageContainer";
import { getPrivateMessages } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Button } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const SentMail = () => {
  const router = useRouter();
  const query = {
    type: "sent",
  };
  const { data, isLoading } = useQuery(["private-messages", query], () =>
    getPrivateMessages(query)
  );

  const gotoCreate = () => router.push("/mails/create");
  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Pribadi</title>
      </Head>
      <PageContainer title="Pesan Terkirim">
        {JSON.stringify(data)}
        <Button onClick={gotoCreate}>Buat Pesan</Button>
      </PageContainer>
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
