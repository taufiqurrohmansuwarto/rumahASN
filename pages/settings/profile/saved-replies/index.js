import ListSavedReplies from "@/components/SavedReplies/ListSavedReplies";
import ProfileLayout from "@/components/ProfileSettings/ProfileLayout";
import Layout from "@/components/Layout";
import Head from "next/head";

function SavedReplies() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Template Balasan</title>
      </Head>
      <ListSavedReplies />
    </>
  );
}

SavedReplies.Auth = {
  action: "manage",
  subject: "tickets",
};

SavedReplies.getLayout = function getLayout(page) {
  return (
    <Layout>
      <ProfileLayout tabActiveKey="saved-replies" title="Template Balasan">
        {page}
      </ProfileLayout>
    </Layout>
  );
};

export default SavedReplies;
