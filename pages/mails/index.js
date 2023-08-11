import Layout from "@/components/Layout";
import MailLayout from "@/components/MailLayout";
import PageContainer from "@/components/PageContainer";
import { getPrivateMessages } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Button } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const Mail = () => {
  const router = useRouter();
  const { data, isLoading } = useQuery(["private-messages"], () =>
    getPrivateMessages({})
  );

  const gotoCreate = () => router.push("/mails/create");

  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Pribadi</title>
      </Head>
      <PageContainer>
        {JSON.stringify(data)}
        <Button onClick={gotoCreate}>Buat Pesan</Button>
      </PageContainer>
    </>
  );
};

Mail.getLayout = function getLayout(page) {
  return (
    <Layout>
      <MailLayout>{page}</MailLayout>
    </Layout>
  );
};

Mail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Mail;
