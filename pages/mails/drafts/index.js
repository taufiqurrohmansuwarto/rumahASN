import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import { Grid } from "antd";
import Head from "next/head";
import EmailListComponent from "@/components/mail/EmailList/EmailListComponent";

const Drafts = () => {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Draft Pesan</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? null : 0,
        }}
      >
        <EmailListComponent folder="drafts" />
      </PageContainer>
    </>
  );
};

Drafts.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/drafts">{page}</GmailLayout>;
};

Drafts.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Drafts;
