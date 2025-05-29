import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import EmailListComponent from "@/components/mail/EmailList/EmailListComponent";

const Important = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Penting</title>
      </Head>
      <PageContainer>
        <EmailListComponent folder="important" />
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
