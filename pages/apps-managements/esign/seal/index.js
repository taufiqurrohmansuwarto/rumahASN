import AdminSeal from "@/components/Esign/Seal/AdminSeal";
import Layout from "@/components/Layout";
import UserManagements from "@/components/Managements/UserManagements";
import PageContainer from "@/components/PageContainer";
import { Card } from "antd";
import Head from "next/head";

const SegelElektronik = () => {
  return (
    <>
      <Head>
        <title>Segel Elektronik</title>
      </Head>
      <PageContainer title="E-Sign" content="Segel Elektronik">
        <Card title="Admin Segel Elektronik">
          <AdminSeal />
          <UserManagements />
        </Card>
      </PageContainer>
    </>
  );
};

SegelElektronik.Auth = {
  action: "manage",
  subject: "Tickets",
};

SegelElektronik.getLayout = function getLayout(page) {
  return <Layout active="/apps-managements/esign/seal">{page}</Layout>;
};

export default SegelElektronik;
