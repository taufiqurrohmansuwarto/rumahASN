import LogLayout from "@/components/Log/LogLayout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";
import LogBSRE from "@/components/Log/LogBSRE";

const LogBSREPage = () => {
  return (
    <>
      <Head>
        <title>Log Unduh Sertifikat TTE</title>
      </Head>
      <PageContainer
        title="Log Unduh Sertifikat TTE"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Log Unduh Sertifikat TTE</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <LogBSRE />
      </PageContainer>
    </>
  );
};

LogBSREPage.getLayout = (page) => (
  <LogLayout active="/logs/bsre">{page}</LogLayout>
);

LogBSREPage.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default LogBSREPage;
