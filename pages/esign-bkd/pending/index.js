import EsignBKDLayout from "@/components/EsignBKD/EsignBKDLayout";
import { PendingRequestsList } from "@/components/EsignBKD";
import Head from "next/head";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Link from "next/link";

const PendingActionsPage = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - E-Sign BKD - Menunggu Tindakan</title>
      </Head>
      <PageContainer
        title="Menunggu Tindakan"
        content="Daftar permintaan tanda tangan yang memerlukan tindakan Anda"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/esign-bkd">Dashboard E-Sign BKD</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Menunggu Tindakan</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <PendingRequestsList />
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
