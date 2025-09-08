import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { UserNotificationCenter } from "@/components/KnowledgeManagements/notifications";
import { FloatButton } from "antd";
import Head from "next/head";
import PageContainer from "@/components/PageContainer";

const AsnKnowledgeMyKnowledgeNotifications = () => {
  useScrollRestoration("notifications-scroll", true, false, true); // Enable smooth restoration

  return (
    <>
      <Head>
        <title>Rumah ASN - Pojok Pengetahuan - Notifikasi</title>
      </Head>
      <LayoutASNConnect active="asn-knowledge">
        <FloatButton.BackTop />
        <UserNotificationCenter />
      </LayoutASNConnect>
    </>
  );
};

AsnKnowledgeMyKnowledgeNotifications.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnKnowledgeMyKnowledgeNotifications.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default AsnKnowledgeMyKnowledgeNotifications;
