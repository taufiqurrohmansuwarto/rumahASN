import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

import { useRouter } from "next/router";

const StarredMailDetail = () => {
  const handleBack = () => router?.back();
  const router = useRouter();
  const { id } = router?.query;

  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Arsip</title>
      </Head>
      <PageContainer title="Pesan Tandai" onBack={handleBack}></PageContainer>
    </>
  );
};

StarredMailDetail.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/starred">{page}</GmailLayout>;
};

StarredMailDetail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default StarredMailDetail;
