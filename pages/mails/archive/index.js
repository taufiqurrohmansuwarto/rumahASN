import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import EmailListComponent from "@/components/mail/EmailList/EmailListComponent";

const Archive = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Arsip Pesan</title>
      </Head>
      <PageContainer>
        <EmailListComponent folder="archive" />
      </PageContainer>
    </>
  );
};

Archive.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/archive">{page}</GmailLayout>;
};

Archive.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Archive;
