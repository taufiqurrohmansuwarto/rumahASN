import LayoutRasnNaskah from "@/components/RasnNaskah/LayoutRasnNaskah";
import DocumentList from "@/components/RasnNaskah/DocumentList";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

const RasnNaskahIndex = () => {
  return (
    <>
      <Head>
        <title>SAKTI Naskah - Dokumen Saya</title>
      </Head>
      <PageContainer
        title="Dokumen Saya"
        subTitle="Kelola dan review dokumen naskah dinas"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">Beranda</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>SAKTI Naskah</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <DocumentList />
      </PageContainer>
    </>
  );
};

RasnNaskahIndex.getLayout = function getLayout(page) {
  return <LayoutRasnNaskah active="/rasn-naskah">{page}</LayoutRasnNaskah>;
};

RasnNaskahIndex.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RasnNaskahIndex;
