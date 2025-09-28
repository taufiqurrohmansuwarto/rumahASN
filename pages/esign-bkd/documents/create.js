import EsignBKDLayout from "@/components/EsignBKD/EsignBKDLayout";
import { DocumentForm } from "@/components/EsignBKD";
import Head from "next/head";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Link from "next/link";

const CreateDocumentPage = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Buat Dokumen Baru E-Sign BKD</title>
      </Head>
      <PageContainer
        title="Buat Dokumen Baru"
        content="Upload dokumen dan atur workflow tanda tangan elektronik"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/esign-bkd">Dashboard E-Sign BKD</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/esign-bkd/documents">Kelola Dokumen</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Buat Dokumen Baru</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <DocumentForm />
      </PageContainer>
    </>
  );
};

CreateDocumentPage.Auth = {
  action: "manage",
  subject: "tickets",
};

CreateDocumentPage.getLayout = (page) => {
  return <EsignBKDLayout active="/esign-bkd/documents">{page}</EsignBKDLayout>;
};

export default CreateDocumentPage;
