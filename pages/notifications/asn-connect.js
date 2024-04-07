import Layout from "@/components/Layout";
import NotificationLayout from "@/components/Notification/NotificationLayout";
import PageContainer from "@/components/PageContainer";
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
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Notifikasi ASN Connect</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Notifikasi"
        content="Notifikasi ASN Connect"
      >
        <NotificationLayout active="asn-connect">
          <div>Not Yet Implemented</div>
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
