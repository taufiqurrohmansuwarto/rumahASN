import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import ProxyKPComponent from "@/components/Rekon/Proxy/SIASN/ProxyKPComponent";
import Head from "next/head";
import { useRouter } from "next/router";
import { Breadcrumb } from "antd";
import Link from "next/link";

const ProxyKenaikanPangkat = () => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekonisiliasi - Integrasi Kenaikan Pangkat</title>
      </Head>
      <PageContainer
        onBack={() => router.push("/rekon/dashboard")}
        title="Integrasi Kenaikan Pangkat"
        content="Sinkronisasi data kenaikan pangkat dengan SIASN"
        subTitle="Kelola dan monitor integrasi data kenaikan pangkat pegawai"
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
              <Breadcrumb.Item>Kenaikan Pangkat</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <ProxyKPComponent />
      </PageContainer>
    </>
  );
};

ProxyKenaikanPangkat.getLayout = (page) => {
  return <RekonLayout active="/rekon/dashboard">{page}</RekonLayout>;
};

ProxyKenaikanPangkat.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default ProxyKenaikanPangkat;
