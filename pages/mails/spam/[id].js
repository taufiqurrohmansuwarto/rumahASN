import GmailLayout from "@/components/GmailLayout";
import EmailDetailComponent from "@/components/mail/Detail/EmailDetailComponent";
import PageContainer from "@/components/PageContainer";
import { useEmailById } from "@/hooks/useEmails";
import Head from "next/head";
import { Grid } from "antd";

import { useRouter } from "next/router";

const SpamMailDetail = () => {
  const breakPoint = Grid.useBreakpoint();
  const handleBack = () => router?.back();
  const router = useRouter();
  const { id } = router?.query;

  const { data: email, isLoading, error, refetch } = useEmailById(id);

  return (
    <>
      <Head>
        <title>{email?.data?.subject} - Rumah ASN - Pesan Spam</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? null : 0,
        }}
        title="Pesan Spam"
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

SpamMailDetail.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/spam">{page}</GmailLayout>;
};

SpamMailDetail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default SpamMailDetail;
