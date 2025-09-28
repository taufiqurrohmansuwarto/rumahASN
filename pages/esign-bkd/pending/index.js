import EsignBKDLayout from "@/components/EsignBKD/EsignBKDLayout";
import { DocumentList } from "@/components/EsignBKD";
import Head from "next/head";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Link from "next/link";

const PendingActionsPage = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Menunggu Tindakan E-Sign BKD</title>
      </Head>
      <PageContainer
        title="Dokumen Menunggu Tindakan"
        content="Daftar dokumen yang memerlukan review atau tanda tangan dari Anda"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/esign-bkd">Dashboard E-Sign BKD</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Dokumen Menunggu Tindakan</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <DocumentList filter="pending" />
      </PageContainer>
    </>
  );
};

PendingActionsPage.Auth = {
  action: "manage",
  subject: "tickets",
};

PendingActionsPage.getLayout = (page) => {
  return <EsignBKDLayout active="/esign-bkd/pending">{page}</EsignBKDLayout>;
};

export default PendingActionsPage;
