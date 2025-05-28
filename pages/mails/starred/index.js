import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import EmailListComponent from "@/components/mail/EmailList/EmailListComponent";

const Starred = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Ditandai</title>
      </Head>
      <PageContainer>
        <EmailListComponent folder="starred" />
      </PageContainer>
    </>
  );
};

Starred.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/starred">{page}</GmailLayout>;
};

Starred.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Starred;
