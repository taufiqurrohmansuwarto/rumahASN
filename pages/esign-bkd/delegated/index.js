import EsignBKDLayout from "@/components/EsignBKD/EsignBKDLayout";
import { DocumentList } from "@/components/EsignBKD";
import Head from "next/head";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Link from "next/link";

const DelegatedDocumentsPage = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Delegasi TTE E-Sign BKD</title>
      </Head>
      <PageContainer
        title="Delegasi Tanda Tangan Elektronik"
        content="Dokumen yang didelegasikan untuk ditandatangani menggunakan TTE"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/esign-bkd">Dashboard E-Sign BKD</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Delegasi TTE</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <DocumentList filter="delegated" />
      </PageContainer>
    </>
  );
};

DelegatedDocumentsPage.Auth = {
  action: "manage",
  subject: "tickets",
};

DelegatedDocumentsPage.getLayout = (page) => {
  return <EsignBKDLayout active="/esign-bkd/delegated">{page}</EsignBKDLayout>;
};

export default DelegatedDocumentsPage;
