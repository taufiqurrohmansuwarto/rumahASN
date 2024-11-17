import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

function TTEDocuments() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Dokumen Tanda Tangan Elektronik</title>
      </Head>
      <PageContainer
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Dokumen Tanda Tangan</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Tanda Tangan Elektronik"
        content="Daftar Dokumen Tanda Tangan Elektronik"
      >
        <div>hello world</div>
      </PageContainer>
    </>
  );
}

TTEDocuments.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

TTEDocuments.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default TTEDocuments;
