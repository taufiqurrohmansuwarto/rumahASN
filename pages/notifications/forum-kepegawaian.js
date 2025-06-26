import Layout from "@/components/Layout";
import ListNotifications from "@/components/ListNotifications";
import NotificationLayout from "@/components/Notification/NotificationLayout";
import PageContainer from "@/components/PageContainer";
import { Grid } from "@mantine/core";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

function ForumKepegawaianNotification() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Notifikasi</title>
      </Head>
      <PageContainer
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Notifikasi Pertanyaan</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Notifikasi Forum Kepegawaian"
        content="Kelola dan pantau semua notifikasi dari aktivitas Forum Kepegawaian Anda"
      >
        <NotificationLayout active="forum-kepegawaian">
          <Grid align="center" justify="center">
            <Grid.Col md={12} sm={12}>
              <ListNotifications />
            </Grid.Col>
          </Grid>
        </NotificationLayout>
      </PageContainer>
    </>
  );
}

ForumKepegawaianNotification.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

ForumKepegawaianNotification.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default ForumKepegawaianNotification;
