import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import ProxyPgProfesiComponent from "@/components/Rekon/Proxy/SIASN/ProxyPgProfesiComponent";
import Head from "next/head";
import { useRouter } from "next/router";
import { Breadcrumb } from "antd";
import Link from "next/link";

const ProxyPGProfesi = () => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekonisiliasi - Integrasi Gelar Profesi</title>
      </Head>
      <PageContainer
        onBack={() => router.push("/rekon/dashboard")}
        title="Integrasi Gelar Profesi"
        content="Sinkronisasi pencantuman gelar profesi dengan SIASN"
        subTitle="Kelola dan monitor integrasi data pencantuman gelar profesi pegawai"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/rekon/dashboard">Rekonisiliasi</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/rekon/dashboard">Dashboard</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/rekon/dashboard">Menu Integrasi</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Gelar Profesi</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <ProxyPgProfesiComponent />
      </PageContainer>
    </>
  );
};

ProxyPGProfesi.getLayout = (page) => {
  return <RekonLayout active="/rekon/dashboard">{page}</RekonLayout>;
};

ProxyPGProfesi.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default ProxyPGProfesi;
