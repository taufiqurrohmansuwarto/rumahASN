import Layout from "@/components/Layout";
import RiwayatUsulanLayout from "@/components/RiwayatUsulan/RiwayatUsulanLayout";
import RwInboxUsulan from "@/components/RiwayatUsulan/RwInboxUsulan";
import { Card } from "antd";
import Head from "next/head";

const InboxUsulan = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Usulan SIASN - Inbox Usulan</title>
      </Head>{" "}
      <RiwayatUsulanLayout
        title="Usulan SIASN"
        content="Inbox Usulan"
        active="inbox-usulan"
        breadcrumbTitle="Inbox Usulan"
      >
        <Card>
          <RwInboxUsulan />
        </Card>
      </RiwayatUsulanLayout>
    </>
  );
};

InboxUsulan.Auth = {
  action: "manage",
  subject: "Tickets",
};

InboxUsulan.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default InboxUsulan;
