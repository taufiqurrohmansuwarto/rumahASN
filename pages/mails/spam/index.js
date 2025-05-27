import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

const Spam = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Spam</title>
      </Head>
      <PageContainer>
        <div>
          <h1>Pesan Spam</h1>
        </div>
      </PageContainer>
    </>
  );
};

Spam.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/spam">{page}</GmailLayout>;
};

Spam.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Spam;
