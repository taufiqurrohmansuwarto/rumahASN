import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import DetailUsulan from "@/components/Usulan/Submitter/DetailUsulan";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

function DetailSubmissionSubmitter() {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Rumah ASN - Daftar Usulan Aplikasi Rumah ASN</title>
      </Head>
      <PageContainer
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Usulan</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Usulan"
        content="Daftar Semua Usulan"
      >
        <DetailUsulan id={router?.query?.id} />
      </PageContainer>
    </>
  );
}

DetailSubmissionSubmitter.getLayout = function getLayout(page) {
  return <Layout active="/submissions/all">{page}</Layout>;
};

DetailSubmissionSubmitter.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default DetailSubmissionSubmitter;
