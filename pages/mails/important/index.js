import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import EmailListComponent from "@/components/mail/EmailList/EmailListComponent";
import { Grid } from "antd";

const Important = () => {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Penting</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? null : 0,
        }}
      >
        <EmailListComponent folder="important" />
      </PageContainer>
    </>
  );
};

Important.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/important">{page}</GmailLayout>;
};

Important.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Important;
