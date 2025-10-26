import KominfoServicesLayout from "@/components/KominfoServices/KominfoServicesLayout";
import FormTTE from "@/components/KominfoServices/FormTTE";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import { useRouter } from "next/router";
import { Breadcrumb } from "antd";
import Link from "next/link";

function CreateTTEPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <Head>
        <title>Rumah ASN - Detail Pengajuan TTE</title>
      </Head>
      <PageContainer
        title="Detail Pengajuan TTE"
        content="Lengkapi dokumen dan informasi untuk pengajuan tanda tangan elektronik"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/kominfo-services/dashboard">Layanan Kominfo</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/kominfo-services/tte">Pengajuan TTE</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Detail Pengajuan</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <FormTTE pengajuanId={id} />
      </PageContainer>
    </>
  );
}

CreateTTEPage.getLayout = function getLayout(page) {
  return (
    <KominfoServicesLayout active="/kominfo-services/tte">
      {page}
    </KominfoServicesLayout>
  );
};

CreateTTEPage.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default CreateTTEPage;
