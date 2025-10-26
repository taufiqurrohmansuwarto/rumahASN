import KominfoServicesLayout from "@/components/KominfoServices/KominfoServicesLayout";
import PageContainer from "@/components/PageContainer";
import CheckUserTTE from "@/components/KominfoServices/CheckUserTTE";
import DaftarPengajuanTTEUser from "@/components/KominfoServices/DaftarPengajuanTTEUser";
import { Stack } from "@mantine/core";
import Head from "next/head";
import { Breadcrumb } from "antd";
import Link from "next/link";

function TTEPage() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Pengajuan Tanda Tangan Elektronik</title>
      </Head>
      <PageContainer
        title="Pengajuan Tanda Tangan Elektronik"
        content="Ajukan dan kelola sertifikat tanda tangan elektronik (TTE) Anda"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/kominfo-services/dashboard">Layanan Kominfo</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Pengajuan TTE</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <Stack gap="md">
          <CheckUserTTE />
          <DaftarPengajuanTTEUser />
        </Stack>
      </PageContainer>
    </>
  );
}

TTEPage.getLayout = function getLayout(page) {
  return (
    <KominfoServicesLayout active="/kominfo-services/tte">
      {page}
    </KominfoServicesLayout>
  );
};

TTEPage.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default TTEPage;
