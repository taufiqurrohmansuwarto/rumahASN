import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import EmailListComponent from "@/components/mail/EmailList/EmailListComponent";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";

const Archive = () => {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Arsip</title>
      </Head>
      <PageContainer
        title="Arsip"
        subTitle="Pesan yang diarsipkan"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">Beranda</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/mails">Pesan Pribadi</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Arsip</Breadcrumb.Item>
          </Breadcrumb>
        )}
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
