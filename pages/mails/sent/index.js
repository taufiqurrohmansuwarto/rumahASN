import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import EmailListComponent from "@/components/mail/EmailList/EmailListComponent";
import Head from "next/head";
import { Grid } from "antd";

const Sent = () => {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Terkirim</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? null : 0,
        }}
      >
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
