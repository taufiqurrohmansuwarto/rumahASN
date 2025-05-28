import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

import { useRouter } from "next/router";

const DraftMailDetail = () => {
  const handleBack = () => router?.back();
  const router = useRouter();
  const { id } = router?.query;

  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Draf</title>
      </Head>
      <PageContainer title="Pesan Draf" onBack={handleBack}></PageContainer>
    </>
  );
};

DraftMailDetail.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/drafts">{page}</GmailLayout>;
};

DraftMailDetail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default DraftMailDetail;
