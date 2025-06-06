import Layout from "@/components/Layout";
import ProfileLayout from "@/components/ProfileSettings/ProfileLayout";
import SavedQuestions from "@/components/ProfileSettings/SavedQuestions";
import Head from "next/head";

const Saved = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Pertanyaan Tersimpan</title>
      </Head>
      <SavedQuestions />
    </>
  );
};

Saved.getLayout = (page) => {
  return (
    <Layout>
      <ProfileLayout tabActiveKey="saved" title="Pertanyaan Tersimpan">
        {page}
      </ProfileLayout>
    </Layout>
  );
};

Saved.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Saved;
