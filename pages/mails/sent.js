import Layout from "@/components/Layout";
import MailLayout from "@/components/MailLayout";
import PageContainer from "@/components/PageContainer";
import ListPrivateMessages from "@/components/PrivateMessages/ListPrivateMessages";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

const SentMail = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Pribadi</title>
      </Head>

      <ListPrivateMessages type="sent" />
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
