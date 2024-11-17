import Layout from "@/components/Layout";
import NotificationLayout from "@/components/Notification/NotificationLayout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

function SubmissionNotification() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Notifikasi Usulan</title>
      </Head>
      <PageContainer
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Notifikasi Usulan</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Notifikasi"
        content="Notifikasi Usulan"
      >
        <NotificationLayout active="submission">
          <div>Not Yet Implemented</div>
        </NotificationLayout>
      </PageContainer>
    </>
  );
}

SubmissionNotification.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

SubmissionNotification.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default SubmissionNotification;
