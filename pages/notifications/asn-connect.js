import Layout from "@/components/Layout";
import NotificationLayout from "@/components/Notification/NotificationLayout";
import PageContainer from "@/components/PageContainer";
import SocmedNotifications from "@/components/Socmed/SocmedNotifications";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

function ASNConnectNotification() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Notifikasi ASN Connect</title>
      </Head>
      <PageContainer
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Notifikasi ASN Connect</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Notifikasi ASN Connect"
        content="Kelola dan pantau semua notifikasi dari aktivitas ASN Connect Anda"
      >
        <NotificationLayout active="asn-connect">
          <SocmedNotifications />
        </NotificationLayout>
      </PageContainer>
    </>
  );
}

ASNConnectNotification.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

ASNConnectNotification.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default ASNConnectNotification;
