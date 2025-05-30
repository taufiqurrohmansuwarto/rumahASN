import GmailLayout from "@/components/GmailLayout";
import EmailDetailComponent from "@/components/mail/Detail/EmailDetailComponent";
import PageContainer from "@/components/PageContainer";
import { useEmailById } from "@/hooks/useEmails";
import Head from "next/head";

import { useRouter } from "next/router";

const DraftMailDetail = () => {
  const handleBack = () => router?.back();
  const router = useRouter();
  const { id } = router?.query;

  const { data: email, isLoading, error, refetch } = useEmailById(id);

  return (
    <>
      <Head>
        <title>{email?.data?.subject} - Rumah ASN - Pesan Draf</title>
      </Head>
      <PageContainer
        title="Pesan Draf"
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

DraftMailDetail.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/drafts">{page}</GmailLayout>;
};

DraftMailDetail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default DraftMailDetail;
