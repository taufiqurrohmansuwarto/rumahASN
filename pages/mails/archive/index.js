import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import EmailListComponent from "@/components/mail/EmailList/EmailListComponent";
import { Grid } from "antd";

const Archive = () => {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Arsip Pesan</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? null : 0,
        }}
      >
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
