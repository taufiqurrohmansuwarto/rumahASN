import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

function SignifyDashboardMyTasks() {
  const router = useRouter();

  const handleBack = () => router.back();

  return (
    <>
      <Head>
        <title>Rumah ASN - Signify Dashboard - Tugas Saya</title>
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
        title="Signify Dashboard - Tugas Saya"
        content="Tugas Saya"
      ></PageContainer>
    </>
  );
}

SignifyDashboardMyTasks.getLayout = function getLayout(page) {
  return <Layout active="/signify/dashboard/my-tasks">{page}</Layout>;
};

SignifyDashboardMyTasks.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default SignifyDashboardMyTasks;
