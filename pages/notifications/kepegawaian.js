import Layout from "@/components/Layout";
import NotificationLayout from "@/components/Notification/NotificationLayout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

function KepegawaianNotification() {
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
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Notifikasi Pertanyaan</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Notifikasi"
        content="Notifikasi Pertanyaan"
      >
        <NotificationLayout active="kepegawaian">
          <div>Not Yet Implemented</div>
        </NotificationLayout>
      </PageContainer>
    </>
  );
}

KepegawaianNotification.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

KepegawaianNotification.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default KepegawaianNotification;
