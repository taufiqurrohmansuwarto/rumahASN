import EsignBKDLayout from "@/components/EsignBKD/EsignBKDLayout";
import { DocumentDetail } from "@/components/EsignBKD";
import Head from "next/head";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";

const DocumentDetailPage = () => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Rumah ASN - Detail Dokumen E-Sign BKD</title>
      </Head>
      <PageContainer
        title="Detail Dokumen"
        content="Informasi lengkap dokumen dan status workflow tanda tangan"
        onBack={() => router.back()}
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
              <Breadcrumb.Item>Detail Dokumen</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <DocumentDetail />
      </PageContainer>
    </>
  );
};

DocumentDetailPage.Auth = {
  action: "manage",
  subject: "tickets",
};

DocumentDetailPage.getLayout = (page) => {
  return <EsignBKDLayout active="/esign-bkd/documents">{page}</EsignBKDLayout>;
};

export default DocumentDetailPage;
