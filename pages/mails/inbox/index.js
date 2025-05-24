import GmailLayout from "@/components/GmailLayout";
import InboxComponent from "@/components/mail/InboxComponent";
import Head from "next/head";

const InboxMail = () => {
  const handleBack = () => router?.back();

  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Pribadi</title>
      </Head>
      <InboxComponent />
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
