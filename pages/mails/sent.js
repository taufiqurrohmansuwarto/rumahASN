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
      <PageContainer
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Pesan Pribadi</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Pesan Terkirim"
        subTitle="Pesan Pribadi"
      >
        <ListPrivateMessages type="sent" />
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
