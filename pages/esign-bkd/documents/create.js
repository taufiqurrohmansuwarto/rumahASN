import EsignBKDLayout from "@/components/EsignBKD/EsignBKDLayout";
import { DocumentForm, SignatureSetupForm } from "@/components/EsignBKD";
import Head from "next/head";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb, Spin } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDocument } from "@/hooks/esign-bkd";

const CreateDocumentPage = () => {
  const router = useRouter();
  const { documentId } = router.query;

  // If documentId exists, fetch document for step 2
  const { data: document, isLoading } = useDocument(documentId, {
    enabled: !!documentId,
  });

  // Step 1: Document creation form
  if (!documentId) {
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
  }

  // Step 2: Signature setup form
  if (isLoading) {
    return (
      <>
        <Head>
          <title>Rumah ASN - Pengaturan Tanda Tangan</title>
        </Head>
        <PageContainer
          title="Pengaturan Tanda Tangan"
          content="Mengatur workflow tanda tangan elektronik"
        >
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
          </div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Rumah ASN - Pengaturan Tanda Tangan</title>
      </Head>
      <PageContainer
        title="Pengaturan Tanda Tangan"
        content="Atur siapa yang akan menandatangani dokumen dan di halaman mana"
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
              <Breadcrumb.Item>Pengaturan Tanda Tangan</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <SignatureSetupForm document={document?.data} />
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
