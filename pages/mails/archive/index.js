import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

const Archive = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Arsip Pesan</title>
      </Head>
      <PageContainer>
        <div>
          <h1>Arsip Pesan</h1>
        </div>
      </PageContainer>
    </>
  );
};

Archive.getLayout = function getLayout(page) {
  return <GmailLayout active="archive">{page}</GmailLayout>;
};

Archive.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Archive;
