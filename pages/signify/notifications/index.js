import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

function SignifyNotifications() {
  const router = useRouter();

  const handleBack = () => router.back();

  return (
    <>
      <Head>
        <title>Rumah ASN - Signify - Pemberitahuan</title>
      </Head>
      <PageContainer
        onBack={handleBack}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Signify</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Signify - Pemberitahuan"
        content="Pemberitahuan"
      ></PageContainer>
    </>
  );
}

SignifyNotifications.getLayout = function getLayout(page) {
  return <Layout active="/signify/notifications">{page}</Layout>;
};

SignifyNotifications.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default SignifyNotifications;
