import Layout from "@/components/Layout";
import NotificationLayout from "@/components/Notification/NotificationLayout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

function PrivateMessageNotification() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Notifikasi Kepegawaian</title>
      </Head>
      <PageContainer
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Notifikasi Pesan Pribadi</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Notifikasi"
        content="Notifikasi Pesan Pribadi"
      >
        <NotificationLayout active="private-message">
          <div>Not Yet Implemented</div>
        </NotificationLayout>
      </PageContainer>
    </>
  );
}

PrivateMessageNotification.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

PrivateMessageNotification.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default PrivateMessageNotification;
