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
        <title>Rumah ASN - Rekonisiliasi - Integrasi Gelar Akademik</title>
      </Head>
      <PageContainer
        onBack={() => router.push("/rekon/dashboard")}
        title="Integrasi Gelar Akademik"
        content="Sinkronisasi pencantuman gelar akademik dengan SIASN"
        subTitle="Kelola dan monitor integrasi data pencantuman gelar akademik pegawai"
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
              <Breadcrumb.Item>Gelar Akademik</Breadcrumb.Item>
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
