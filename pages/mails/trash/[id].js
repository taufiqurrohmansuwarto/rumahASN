import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

import { useRouter } from "next/router";

const TrashMailDetail = () => {
  const handleBack = () => router?.back();
  const router = useRouter();
  const { id } = router?.query;

  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Arsip</title>
      </Head>
      <PageContainer title="Pesan Sampah" onBack={handleBack}></PageContainer>
    </>
  );
};

TrashMailDetail.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/trash">{page}</GmailLayout>;
};

TrashMailDetail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default TrashMailDetail;
