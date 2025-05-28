import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

import { useRouter } from "next/router";

const SpamMailDetail = () => {
  const handleBack = () => router?.back();
  const router = useRouter();
  const { id } = router?.query;

  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Spam</title>
      </Head>
      <PageContainer title="Pesan Spam" onBack={handleBack}></PageContainer>
    </>
  );
};

SpamMailDetail.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/spam">{page}</GmailLayout>;
};

SpamMailDetail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default SpamMailDetail;
