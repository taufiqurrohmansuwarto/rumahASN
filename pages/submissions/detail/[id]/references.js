import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import DetailSubmission from "@/components/Usulan/Submitter/DetailSubmission";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

function DetailSubmissionReferences() {
  const router = useRouter();

  const handleBack = () => router.back();

  return (
    <>
      <Head>
        <title>Rumah ASN - Detail Informasi Usulan</title>
      </Head>
      <PageContainer
        onBack={handleBack}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Usulan</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Usulan"
        content="Detail Informasi Usulan"
      >
        <DetailSubmission />
      </PageContainer>
    </>
  );
}

DetailSubmissionReferences.getLayout = function getLayout(page) {
  return <Layout active="/submissions/all">{page}</Layout>;
};

DetailSubmissionReferences.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default DetailSubmissionReferences;
