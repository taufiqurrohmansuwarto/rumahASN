import GmailLayout from "@/components/GmailLayout";
import EmailDetailComponent from "@/components/mail/Detail/EmailDetailComponent";
import PageContainer from "@/components/PageContainer";
import { useEmailById } from "@/hooks/useEmails";
import Head from "next/head";
import { Grid } from "antd";
import { useRouter } from "next/router";

const LabelMailDetail = () => {
  const breakPoint = Grid.useBreakpoint();
  const handleBack = () => router?.back();
  const router = useRouter();
  const { labelId: id } = router?.query;

  const { data: email, isLoading, error, refetch } = useEmailById(id);

  return (
    <>
      <Head>
        <title>{email?.data?.subject} - Rumah ASN - Pesan Penting</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? null : 0,
        }}
        title="Pesan Penting"
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

LabelMailDetail.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/label">{page}</GmailLayout>;
};

LabelMailDetail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default LabelMailDetail;
