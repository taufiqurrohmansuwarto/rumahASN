import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import Head from "next/head";
import ProxyPensiunComponent from "@/components/Rekon/Proxy/SIASN/ProxyPensiunComponent";
import { useRouter } from "next/router";
import { Breadcrumb } from "antd";
import Link from "next/link";
import useScrollRestoration from "@/hooks/useScrollRestoration";

const ProxyPensiun = () => {
  const router = useRouter();

  useScrollRestoration("proxy-pensiun-scroll", true, false, true);

  return (
    <>
      <Head>
        <title>Rumah ASN - Rekonisiliasi - Integrasi Pensiun</title>
      </Head>
      <PageContainer
        onBack={() => router.push("/rekon/dashboard")}
        title="Integrasi Data Pensiun"
        content="Sinkronisasi data pensiun dengan SIASN"
        subTitle="Kelola dan monitor integrasi data pensiun pegawai"
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
              <Breadcrumb.Item>Data Pensiun</Breadcrumb.Item>
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
