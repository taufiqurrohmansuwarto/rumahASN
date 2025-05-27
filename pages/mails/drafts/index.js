import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

const Drafts = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Draft Pesan</title>
      </Head>
      <PageContainer>
        <div>
          <h1>Draft Pesan</h1>
        </div>
      </PageContainer>
    </>
  );
};

Drafts.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/drafts">{page}</GmailLayout>;
};

Drafts.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Drafts;
