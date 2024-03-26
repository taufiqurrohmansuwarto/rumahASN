import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

function AllSubmission() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Surat Keputusan Tanda Tangan Elektronik</title>
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
      ></PageContainer>
    </>
  );
}

AllSubmission.getLayout = function getLayout(page) {
  return <Layout active="/submissions/all">{page}</Layout>;
};

AllSubmission.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default AllSubmission;
