import KominfoServicesLayout from "@/components/KominfoServices/KominfoServicesLayout";
import PageContainer from "@/components/PageContainer";
import CheckUserTTE from "@/components/KominfoServices/CheckUserTTE";
import DaftarPengajuanTTEUser from "@/components/KominfoServices/DaftarPengajuanTTEUser";
import { Stack } from "@mantine/core";
import Head from "next/head";

function TTEPage() {
  return (
    <>
      <Head>
        <title>Kelola Tanda Tangan Elektronik</title>
        <meta name="description" content="Kelola tanda tangan elektronik" />
      </Head>
      <PageContainer
        title="Kelola Tanda Tangan Elektronik"
        subTitle="Kelola pengajuan dan daftar tanda tangan elektronik"
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
