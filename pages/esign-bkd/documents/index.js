import EsignBKDLayout from "@/components/EsignBKD/EsignBKDLayout";
import { DocumentList } from "@/components/EsignBKD";
import Head from "next/head";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Link from "next/link";

const EsignBKDDocuments = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Kelola Dokumen E-Sign BKD</title>
      </Head>
      <PageContainer
        title="Kelola Dokumen"
        content="Manajemen dokumen elektronik dan workflow tanda tangan digital"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/esign-bkd">Dashboard E-Sign BKD</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Kelola Dokumen</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <DocumentList />
      </PageContainer>
    </>
  );
};

EsignBKDDocuments.Auth = {
  action: "manage",
  subject: "tickets",
};

EsignBKDDocuments.getLayout = (page) => {
  return <EsignBKDLayout active="/esign-bkd/documents">{page}</EsignBKDLayout>;
};

export default EsignBKDDocuments;
