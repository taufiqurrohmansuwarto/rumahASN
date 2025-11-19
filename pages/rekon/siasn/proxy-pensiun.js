import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import Head from "next/head";
import ProxyPensiunComponent from "@/components/Rekon/Proxy/SIASN/ProxyPensiunComponent";
import { useRouter } from "next/router";
import { Breadcrumb } from "antd";
import Link from "next/link";

const ProxyPensiun = () => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Proxy Sinkronisasi</title>
      </Head>
      <PageContainer
        onBack={() => router.push("/rekon/dashboard")}
        title="Rekon"
        content="Proxy Pensiun"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/rekon/dashboard">Dashboard</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Proxy Pensiun</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <ProxyPensiunComponent />
      </PageContainer>
    </>
  );
};

ProxyPensiun.getLayout = (page) => {
  return <RekonLayout active="/rekon/dashboard">{page}</RekonLayout>;
};

ProxyPensiun.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default ProxyPensiun;
