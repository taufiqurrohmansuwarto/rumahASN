import Head from "next/head";
import { Typography } from "antd";
import ChatLayout from "@/components/ChatLayout";
import { RolesManager } from "@/components/RasnChat";

const { Title } = Typography;

function RolesPage() {
  return (
    <>
      <Head>
        <title>Kelola Roles - RASN Chat | Rumah ASN</title>
      </Head>

      <div style={{ padding: 24 }}>
        <Title level={4} style={{ marginBottom: 16 }}>
          Kelola Roles
        </Title>

        <RolesManager />
      </div>
    </>
  );
}

RolesPage.getLayout = function getLayout(page) {
  return <ChatLayout>{page}</ChatLayout>;
};

RolesPage.Auth = {
  action: "manage",
  subject: "tickets",
};

export default RolesPage;
