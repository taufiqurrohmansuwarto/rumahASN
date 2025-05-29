import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import EmailListComponent from "@/components/mail/EmailList/EmailListComponent";

const Trash = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Sampah Pesan</title>
      </Head>
      <PageContainer>
        <EmailListComponent folder="trash" />
      </PageContainer>
    </>
  );
};

Trash.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/trash">{page}</GmailLayout>;
};

Trash.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Trash;
