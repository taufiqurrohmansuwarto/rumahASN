import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import ProfileLayout from "@/components/ProfileSettings/ProfileLayout";
import SavedQuestions from "@/components/ProfileSettings/SavedQuestions";
import Head from "next/head";

const Saved = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Konfigurasi - Daftar Pertanyaan Tersimpan</title>
      </Head>
      <PageContainer title="Daftar Pertanyaan Tersimpan">
        <SavedQuestions />
      </PageContainer>
    </>
  );
};

Saved.getLayout = (page) => {
  return (
    <Layout>
      <ProfileLayout tabActiveKey="saved">{page}</ProfileLayout>
    </Layout>
  );
};

Saved.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Saved;
