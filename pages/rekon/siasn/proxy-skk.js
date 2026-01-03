import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import ProxySkkComponent from "@/components/Rekon/Proxy/SIASN/ProxySkkComponent";
import Head from "next/head";
import { useRouter } from "next/router";
import { Breadcrumb } from "antd";
import Link from "next/link";
import useScrollRestoration from "@/hooks/useScrollRestoration";

const ProxySKK = () => {
  const router = useRouter();

  useScrollRestoration("proxy-skk-scroll", true, false, true);

  return (
    <>
      <Head>
        <title>Rumah ASN - Rekonisiliasi - Integrasi SKK</title>
      </Head>
      <PageContainer
        onBack={() => router.push("/rekon/dashboard")}
        title="Integrasi Status Kedudukan Kepegawaian"
        content="Sinkronisasi data SKK dengan SIASN"
        subTitle="Kelola dan monitor integrasi data status kedudukan kepegawaian pegawai"
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
              <Breadcrumb.Item>Status Kedudukan Kepegawaian</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <ProxySkkComponent />
      </PageContainer>
    </>
  );
};

ProxySKK.getLayout = (page) => {
  return <RekonLayout active="/rekon/dashboard">{page}</RekonLayout>;
};

ProxySKK.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default ProxySKK;
