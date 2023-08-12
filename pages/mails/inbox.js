import Layout from "@/components/Layout";
import MailLayout from "@/components/MailLayout";
import ListPrivateMessages from "@/components/PrivateMessages/ListPrivateMessages";
import { PageContainer } from "@ant-design/pro-layout";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

const InboxMail = () => {
  const handleBack = () => router?.back();

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
        // onBack={handleBack}
        title="Kotak Masuk"
        subTitle="Pesan Pribadi"
      >
        <ListPrivateMessages type="inbox" />
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
