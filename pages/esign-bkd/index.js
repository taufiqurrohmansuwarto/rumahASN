import EsignBKDLayout from "@/components/EsignBKD/EsignBKDLayout";
import { EsignBkdDashboard } from "@/components/EsignBKD";
import Head from "next/head";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Link from "next/link";

const EsignBKD = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - E-Sign BKD Dashboard</title>
      </Head>
      <PageContainer
        title="Dashboard E-Sign BKD"
        content="Kelola dokumen elektronik dan tanda tangan digital BKD"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Dashboard E-Sign BKD</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <EsignBkdDashboard />
      </PageContainer>
    </>
  );
};

EsignBKD.Auth = {
  action: "manage",
  subject: "tickets",
};

EsignBKD.getLayout = (page) => {
  return <EsignBKDLayout active="/esign-bkd">{page}</EsignBKDLayout>;
};

export default EsignBKD;
