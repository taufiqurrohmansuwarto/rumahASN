import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import EmailListComponent from "@/components/mail/EmailList/EmailListComponent";
import Head from "next/head";

const InboxMail = () => {
  const handleBack = () => router?.back();

  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Pribadi</title>
      </Head>
      <PageContainer>
        <EmailListComponent folder="inbox" />
      </PageContainer>
    </>
  );
};

InboxMail.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/inbox">{page}</GmailLayout>;
};

InboxMail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default InboxMail;
