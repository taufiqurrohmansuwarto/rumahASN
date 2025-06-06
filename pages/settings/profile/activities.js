import Layout from "@/components/Layout";
import ProfileLayout from "@/components/ProfileSettings/ProfileLayout";
import UserActivities from "@/components/ProfileSettings/UserActivities";
import Head from "next/head";

const Activities = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Aktivitas</title>
      </Head>
      <UserActivities />
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
      <ProfileLayout tabActiveKey="activities" title="Aktivitas">
        {page}
      </ProfileLayout>
    </Layout>
  );
};

export default Activities;
