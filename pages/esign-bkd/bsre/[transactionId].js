import EsignBKDLayout from "@/components/EsignBKD/EsignBKDLayout";
import { BsreTransactionDetail } from "@/components/EsignBKD";
import Head from "next/head";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";

const BsreTransactionDetailPage = () => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Rumah ASN - Detail Transaksi BSrE E-Sign BKD</title>
      </Head>
      <PageContainer
        onBack={() => router.back()}
        title="Detail Transaksi BSrE"
        content="Informasi detail transaksi integrasi BSrE untuk tanda tangan elektronik"
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
                <Link href="/esign-bkd/bsre">Transaksi BSrE</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Detail Transaksi</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <BsreTransactionDetail />
      </PageContainer>
    </>
  );
};

BsreTransactionDetailPage.Auth = {
  action: "manage",
  subject: "tickets",
};

BsreTransactionDetailPage.getLayout = (page) => {
  return <EsignBKDLayout active="/esign-bkd/bsre">{page}</EsignBKDLayout>;
};

export default BsreTransactionDetailPage;
