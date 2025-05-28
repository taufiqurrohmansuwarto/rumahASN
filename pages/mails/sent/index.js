import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import EmailListComponent from "@/components/mail/EmailList/EmailListComponent";
import Head from "next/head";

const Sent = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Terkirim</title>
      </Head>
      <PageContainer>
        <EmailListComponent folder="sent" />
      </PageContainer>
    </>
  );
};

Sent.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/sent">{page}</GmailLayout>;
};

Sent.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Sent;
