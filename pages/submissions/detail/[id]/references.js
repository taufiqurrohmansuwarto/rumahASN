import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import BuatUsulan from "@/components/Usulan/Submitter/BuatUsulan";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

function DetailSubmissionReferences() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Detail Informasi Usulan</title>
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
        content="Detail Informasi Usulan"
      ></PageContainer>
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
