import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

import { useRouter } from "next/router";

const SentMailDetail = () => {
  const handleBack = () => router?.back();
  const router = useRouter();
  const { id } = router?.query;

  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Terkirim</title>
      </Head>
      <PageContainer title="Pesan Terkirim" onBack={handleBack}></PageContainer>
    </>
  );
};

SentMailDetail.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/sent">{page}</GmailLayout>;
};

SentMailDetail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default SentMailDetail;
