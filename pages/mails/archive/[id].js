import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

import { useRouter } from "next/router";

const ArchiveMailDetail = () => {
  const handleBack = () => router?.back();
  const router = useRouter();
  const { id } = router?.query;

  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Arsip</title>
      </Head>
      <PageContainer title="Pesan Arsip" onBack={handleBack}></PageContainer>
    </>
  );
};

ArchiveMailDetail.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/archive">{page}</GmailLayout>;
};

ArchiveMailDetail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default ArchiveMailDetail;
