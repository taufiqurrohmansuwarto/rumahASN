import Head from "next/head";
import { Typography } from "antd";
import ChatLayout from "@/components/ChatLayout";
import { RolesManager } from "@/components/RasnChat";
import PageContainer from "@/components/PageContainer";

const { Title } = Typography;

function RolesPage() {
  return (
    <>
      <Head>
        <title>Kelola Roles - RASN Chat | Rumah ASN</title>
      </Head>

      <PageContainer title="Kelola Roles" content="Kelola roles pada channel">
        <RolesManager />
      </PageContainer>
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
