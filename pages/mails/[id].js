import Layout from "@/components/Layout";
import MailLayout from "@/components/MailLayout";
import DetailPrivateMessage from "@/components/PrivateMessages/DetailPrivateMessage";
import { detailPrivateMessage } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { useRouter } from "next/router";

const Mail = () => {
  const router = useRouter();

  const handleBack = () => router.back();

  const { data, isLoading } = useQuery(
    ["detail_private_message", router.query.id],
    () => detailPrivateMessage(router?.query?.id)
  );

  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Pribadi</title>
      </Head>
      <DetailPrivateMessage data={data} />
    </>
  );
};

Mail.getLayout = function getLayout(page) {
  return (
    <Layout>
      <MailLayout active="inbox">{page}</MailLayout>
    </Layout>
  );
};

Mail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Mail;
