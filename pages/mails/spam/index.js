import GmailLayout from "@/components/GmailLayout";
import EmailListComponent from "@/components/mail/EmailList/EmailListComponent";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";

const Spam = () => {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Spam</title>
      </Head>
      <PageContainer
        title="Spam"
        subTitle="Pesan yang dicurigai spam"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">Beranda</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/mails">Pesan Pribadi</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Spam</Breadcrumb.Item>
          </Breadcrumb>
        )}
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
