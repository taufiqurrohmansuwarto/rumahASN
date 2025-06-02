import GmailLayout from "@/components/GmailLayout";
import EmailListComponent from "@/components/mail/EmailList/EmailListComponent";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import { Grid } from "antd";

const Spam = () => {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Spam</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? null : 0,
        }}
      >
        <EmailListComponent folder="spam" />
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
