import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import EmailListComponent from "@/components/mail/EmailList/EmailListComponent";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";

const Drafts = () => {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Draf Pesan</title>
      </Head>
      <PageContainer
        title="Draf"
        subTitle="Pesan yang belum dikirim"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">Beranda</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/mails">Pesan Pribadi</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Draf</Breadcrumb.Item>
          </Breadcrumb>
        )}
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
