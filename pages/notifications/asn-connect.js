import Layout from "@/components/Layout";
import NotificationLayout from "@/components/Notification/NotificationLayout";
import PageContainer from "@/components/PageContainer";
import SocmedNotifications from "@/components/Socmed/SocmedNotifications";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";

function ASNConnectNotification() {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Notifikasi ASN Connect</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Notifikasi ASN Connect</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Notifikasi"
        content="ASN Connect"
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
