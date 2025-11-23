import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import ProxySinkronisasiComponent from "@/components/Rekon/ProxySinkronisasi";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

const ProxySinkronisasi = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekonisiliasi - Proxy Sinkronisasi</title>
      </Head>
      <PageContainer
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/rekon/dashboard">Rekonisiliasi</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/rekon/dashboard">Dashboard</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Proxy Sinkronisasi</Breadcrumb.Item>
          </Breadcrumb>
        )}
        title="Proxy Sinkronisasi Data"
        content="Kelola proxy sinkronisasi data SIASN"
        subTitle="Atur dan monitor koneksi proxy untuk sinkronisasi data dengan sistem SIASN"
      >
        <ProxySinkronisasiComponent />
      </PageContainer>
    </>
  );
};

ProxySinkronisasi.getLayout = (page) => {
  return <RekonLayout active="/rekon/proxy-sinkronisasi">{page}</RekonLayout>;
};

ProxySinkronisasi.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default ProxySinkronisasi;
