import KominfoServicesLayout from "@/components/KominfoServices/KominfoServicesLayout";
import FormTTE from "@/components/KominfoServices/FormTTE";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import { useRouter } from "next/router";

function CreateTTEPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <Head>
        <title>Pengajuan Tanda Tangan Elektronik</title>
        <meta
          name="description"
          content="Detail pengajuan tanda tangan elektronik"
        />
      </Head>
      <PageContainer
        title="Pengajuan Tanda Tangan Elektronik"
        subTitle="Kelola pengajuan TTE Anda"
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
