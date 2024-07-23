import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import DetailMail from "@/components/PrivateMessages/DetailMail";
import Head from "next/head";

const InboxMail = () => {
  const handleBack = () => router?.back();

  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Pribadi</title>
      </Head>
      <DetailMail />
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
