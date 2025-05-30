import GmailLayout from "@/components/GmailLayout";
import EmailDetailComponent from "@/components/mail/Detail/EmailDetailComponent";
import PageContainer from "@/components/PageContainer";
import { useEmailById } from "@/hooks/useEmails";
import Head from "next/head";

import { useRouter } from "next/router";

const SentMailDetail = () => {
  const handleBack = () => router?.back();
  const router = useRouter();
  const { id } = router?.query;

  const { data: email, isLoading, error, refetch } = useEmailById(id);

  return (
    <>
      <Head>
        <title>{email?.data?.subject} - Rumah ASN - Pesan Terkirim</title>
      </Head>
      <PageContainer
        title="Pesan Terkirim"
        subTitle={email?.data?.subject}
        onBack={handleBack}
      >
        <EmailDetailComponent
          email={email?.data}
          loading={isLoading}
          error={error}
          onRefresh={refetch}
        />
      </PageContainer>
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
