import RedisManagement from "@/components/LayananSIASN/RedisManagement";
import RemoveTreeSIASN from "@/components/LayananSIASN/RemoveTreeSIASN";
import Layout from "@/components/Layout";
import UserManagements from "@/components/Managements/UserManagements";
import FineTunning from "@/components/Managements/FineTunning";
import { Card } from "antd";

const { default: PageContainer } = require("@/components/PageContainer");
const { default: Head } = require("next/head");

const ManagementUsers = () => {
  return (
    <>
      <Head>
        <title>Management Users</title>
        <meta name="description" content="Management Users" />
      </Head>
      <PageContainer title="Manajemen Pengguna" content="Manajemen Pengguna">
        <Card>
          <UserManagements />
          <RemoveTreeSIASN />
          <RedisManagement />
          <FineTunning />
        </Card>
      </PageContainer>
    </>
  );
};

ManagementUsers.Auth = {
  action: "manage",
  subject: "Tickets",
};

ManagementUsers.getLayout = (page) => {
  return <Layout active="/management-users">{page}</Layout>;
};

export default ManagementUsers;
