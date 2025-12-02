import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import EmailListComponent from "@/components/mail/EmailList/EmailListComponent";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";

const Important = () => {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Penting</title>
      </Head>
      <PageContainer
        title="Penting"
        subTitle="Pesan yang ditandai penting"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">Beranda</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/mails">Pesan Pribadi</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Penting</Breadcrumb.Item>
          </Breadcrumb>
        )}
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
