import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import ProxySkkComponent from "@/components/Rekon/Proxy/SIASN/ProxySkkComponent";
import Head from "next/head";
import { useRouter } from "next/router";
import { Breadcrumb } from "antd";
import Link from "next/link";

const ProxySKK = () => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Proxy Sinkronisasi</title>
      </Head>
      <PageContainer
        onBack={() => router.push("/rekon/dashboard")}
        title="Rekon"
        content="Proxy SKK"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/rekon/dashboard">Dashboard</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Proxy SKK</Breadcrumb.Item>
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
