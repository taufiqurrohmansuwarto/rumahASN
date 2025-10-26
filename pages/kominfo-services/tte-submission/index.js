import KominfoServicesLayout from "@/components/KominfoServices/KominfoServicesLayout";
import PageContainer from "@/components/PageContainer";
import DaftarTTEPengajuanAdmin from "@/components/KominfoServices/DaftarTTEPengajuanAdmin";
import Head from "next/head";

function TTESubmissionPage() {
  return (
    <>
      <Head>
        <title>Kelola Pengajuan TTE</title>
        <meta
          name="description"
          content="Kelola pengajuan tanda tangan elektronik"
        />
      </Head>
      <PageContainer
        title="Kelola Pengajuan TTE"
        subTitle="Kelola pengajuan dan daftar tanda tangan elektronik"
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
