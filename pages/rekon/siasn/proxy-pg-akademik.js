import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import ProxyPgAkademikComponent from "@/components/Rekon/Proxy/SIASN/ProxyPgAkademikComponent";
import Head from "next/head";
import { useRouter } from "next/router";
import { Breadcrumb } from "antd";
import Link from "next/link";

const ProxyPGAkademik = () => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Proxy Sinkronisasi</title>
      </Head>
      <PageContainer
        onBack={() => router.push("/rekon/dashboard")}
        title="Rekon"
        content="Proxy Kenaikan Pangkat"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/rekon/dashboard">Dashboard</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Proxy PG Akademik</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <ProxyPgAkademikComponent />
      </PageContainer>
    </>
  );
};

ProxyPGAkademik.getLayout = (page) => {
  return <RekonLayout active="/rekon/dashboard">{page}</RekonLayout>;
};

ProxyPGAkademik.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default ProxyPGAkademik;
