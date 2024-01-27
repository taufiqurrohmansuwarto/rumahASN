import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

function TTESuratKeputusan() {
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
              <Breadcrumb.Item>
                Surat Keputusan Tanda Tangan Elektronik
              </Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Tanda Tangan Elektronik"
        content="Daftar Surat Keputusan Tanda Tangan Elektronik"
      >
        <div>hello world</div>
      </PageContainer>
    </>
  );
}

TTESuratKeputusan.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

TTESuratKeputusan.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default TTESuratKeputusan;
