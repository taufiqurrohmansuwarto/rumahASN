import Layout from "@/components/Layout";
import ProfileLayout from "@/components/ProfileSettings/ProfileLayout";
import UserActivities from "@/components/ProfileSettings/UserActivities";
import { Card, PageHeader } from "antd";
import Head from "next/head";

const Activities = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Aktivitas</title>
      </Head>
      <PageHeader title="Aktivitas Saya">
        <UserActivities />
      </PageHeader>
    </>
  );
};

Activities.getLayout = (page) => {
  return (
    <Layout>
      <ProfileLayout tabActiveKey="activities">{page}</ProfileLayout>
    </Layout>
  );
};

Activities.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Activities;
