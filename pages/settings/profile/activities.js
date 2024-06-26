import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import ProfileLayout from "@/components/ProfileSettings/ProfileLayout";
import UserActivities from "@/components/ProfileSettings/UserActivities";
import Head from "next/head";

const Activities = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Aktivitas</title>
      </Head>
      <PageContainer>
        <UserActivities />
      </PageContainer>
    </>
  );
};

Activities.Auth = {
  action: "manage",
  subject: "Tickets",
};

Activities.getLayout = function getLayout(page) {
  return (
    <Layout>
      <ProfileLayout tabActiveKey="activities">{page}</ProfileLayout>
    </Layout>
  );
};

export default Activities;
