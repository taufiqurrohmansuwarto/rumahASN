import LayoutRasnNaskah from "@/components/RasnNaskah/LayoutRasnNaskah";
import DocumentUpload from "@/components/RasnNaskah/DocumentUpload";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

const RasnNaskahUpload = () => {
  return (
    <>
      <Head>
        <title>SAKTI Naskah - Upload Dokumen</title>
      </Head>
      <PageContainer
        title="Upload Dokumen"
        subTitle="Upload dokumen untuk direview oleh AI"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">Beranda</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/rasn-naskah">SAKTI Naskah</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Upload</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <DocumentUpload />
      </PageContainer>
    </>
  );
};

RasnNaskahUpload.getLayout = function getLayout(page) {
  return (
    <LayoutRasnNaskah active="/rasn-naskah/upload">{page}</LayoutRasnNaskah>
  );
};

RasnNaskahUpload.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RasnNaskahUpload;
