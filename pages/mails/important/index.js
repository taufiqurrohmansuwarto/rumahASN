import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

const Important = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Penting</title>
      </Head>
      <PageContainer>
        <div>
          <h1>Pesan Penting</h1>
        </div>
      </PageContainer>
    </>
  );
};

Important.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/important">{page}</GmailLayout>;
};

Important.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Important;
