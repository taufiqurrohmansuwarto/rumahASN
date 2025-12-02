import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import EmailListComponent from "@/components/mail/EmailList/EmailListComponent";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";

const Sent = () => {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Terkirim</title>
      </Head>
      <PageContainer
        title="Terkirim"
        subTitle="Pesan yang sudah dikirim"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">Beranda</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/mails">Pesan Pribadi</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Terkirim</Breadcrumb.Item>
          </Breadcrumb>
        )}
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
