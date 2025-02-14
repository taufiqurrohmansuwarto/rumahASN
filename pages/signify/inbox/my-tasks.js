import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

function SignifyInboxMyTasks() {
  const router = useRouter();

  const handleBack = () => router.back();

  return (
    <>
      <Head>
        <title>Rumah ASN - Signify - Inbox - Tugas Saya</title>
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
        title="Signify - Inbox - Tugas Saya"
        content="Tugas Saya"
      ></PageContainer>
    </>
  );
}

SignifyInboxMyTasks.getLayout = function getLayout(page) {
  return <Layout active="/signify/inbox/my-tasks">{page}</Layout>;
};

SignifyInboxMyTasks.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default SignifyInboxMyTasks;
