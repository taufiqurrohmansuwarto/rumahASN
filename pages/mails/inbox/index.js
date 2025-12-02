import GmailLayout from "@/components/GmailLayout";
import EmailListComponent from "@/components/mail/EmailList/EmailListComponent";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";

const InboxMail = () => {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Kotak Masuk</title>
      </Head>
      <PageContainer
        title="Kotak Masuk"
        subTitle="Pesan yang diterima"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">Beranda</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/mails">Pesan Pribadi</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Kotak Masuk</Breadcrumb.Item>
          </Breadcrumb>
        )}
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
