import KominfoServicesLayout from "@/components/KominfoServices/KominfoServicesLayout";
import PageContainer from "@/components/PageContainer";
import DaftarTTEPengajuanAdmin from "@/components/KominfoServices/DaftarTTEPengajuanAdmin";
import Head from "next/head";
import { Breadcrumb } from "antd";
import Link from "next/link";

function TTESubmissionPage() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Kelola Pengajuan TTE</title>
      </Head>
      <PageContainer
        title="Kelola Pengajuan TTE"
        content="Proses dan kelola pengajuan tanda tangan elektronik dari pegawai"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/kominfo-services/dashboard">Layanan Kominfo</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Kelola Pengajuan TTE</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <DaftarTTEPengajuanAdmin />
      </PageContainer>
    </>
  );
}

TTESubmissionPage.getLayout = function getLayout(page) {
  return (
    <KominfoServicesLayout active="/kominfo-services/tte-submission">
      {page}
    </KominfoServicesLayout>
  );
};

TTESubmissionPage.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default TTESubmissionPage;
