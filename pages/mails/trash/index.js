import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import EmailListComponent from "@/components/mail/EmailList/EmailListComponent";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";

const Trash = () => {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Sampah</title>
      </Head>
      <PageContainer
        title="Sampah"
        subTitle="Pesan yang dihapus"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">Beranda</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/mails">Pesan Pribadi</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Sampah</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <EmailListComponent folder="trash" />
      </PageContainer>
    </>
  );
};

Trash.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/trash">{page}</GmailLayout>;
};

Trash.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Trash;
