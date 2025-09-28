import EsignBKDLayout from "@/components/EsignBKD/EsignBKDLayout";
import { BsreTransactionList } from "@/components/EsignBKD";
import Head from "next/head";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Link from "next/link";

const BsreMonitoringPage = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Monitor BSrE E-Sign BKD</title>
      </Head>
      <PageContainer
        title="Monitor Transaksi BSrE"
        content="Monitoring integrasi dengan Balai Sertifikasi Elektronik (BSrE)"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/esign-bkd">Dashboard E-Sign BKD</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Monitor BSrE</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <BsreTransactionList />
      </PageContainer>
    </>
  );
};

BsreMonitoringPage.Auth = {
  action: "manage",
  subject: "tickets",
};

BsreMonitoringPage.getLayout = (page) => {
  return <EsignBKDLayout active="/esign-bkd/bsre">{page}</EsignBKDLayout>;
};

export default BsreMonitoringPage;
