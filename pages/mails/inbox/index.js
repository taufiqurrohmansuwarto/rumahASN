import GmailLayout from "@/components/GmailLayout";
import EmailListComponent from "@/components/mail/EmailList/EmailListComponent";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import { Grid } from "antd";

const InboxMail = () => {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Pribadi</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? null : 0,
        }}
      >
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
