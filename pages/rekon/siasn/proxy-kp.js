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
        <title>Rumah ASN - Rekon - Proxy Sinkronisasi</title>
      </Head>
      <PageContainer
        onBack={() => router.back()}
        title="Rekon"
        content="Proxy Kenaikan Pangkat"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/rekon/dashboard">Dashboard</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Proxy Kenaikan Pangkat</Breadcrumb.Item>
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
