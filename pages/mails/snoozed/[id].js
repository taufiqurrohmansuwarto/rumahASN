import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

import { useRouter } from "next/router";

const SnoozedMailDetail = () => {
  const handleBack = () => router?.back();
  const router = useRouter();
  const { id } = router?.query;

  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Ditunda</title>
      </Head>
      <PageContainer title="Pesan Ditunda" onBack={handleBack}></PageContainer>
    </>
  );
};

SnoozedMailDetail.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/snoozed">{page}</GmailLayout>;
};

SnoozedMailDetail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default SnoozedMailDetail;
