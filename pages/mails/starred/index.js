import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import EmailListComponent from "@/components/mail/EmailList/EmailListComponent";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";

const Starred = () => {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Ditandai</title>
      </Head>
      <PageContainer
        title="Ditandai"
        subTitle="Pesan yang ditandai bintang"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">Beranda</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/mails">Pesan Pribadi</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Ditandai</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <EmailListComponent folder="starred" />
      </PageContainer>
    </>
  );
};

Starred.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/starred">{page}</GmailLayout>;
};

Starred.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Starred;
