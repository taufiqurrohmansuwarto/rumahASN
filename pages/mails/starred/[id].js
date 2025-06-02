import GmailLayout from "@/components/GmailLayout";
import EmailDetailComponent from "@/components/mail/Detail/EmailDetailComponent";
import PageContainer from "@/components/PageContainer";
import { useEmailById } from "@/hooks/useEmails";
import Head from "next/head";
import { Grid } from "antd";
import { useRouter } from "next/router";

const StarredMailDetail = () => {
  const breakPoint = Grid.useBreakpoint();
  const handleBack = () => router?.back();
  const router = useRouter();
  const { id } = router?.query;

  const { data: email, isLoading, error, refetch } = useEmailById(id);

  return (
    <>
      <Head>
        <title>{email?.data?.subject} - Rumah ASN - Pesan Tandai</title>
      </Head>
      <PageContainer
        title="Pesan Tandai"
        subTitle={email?.data?.subject}
        onBack={handleBack}
        childrenContentStyle={{
          padding: breakPoint.xs ? null : 0,
        }}
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

StarredMailDetail.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/starred">{page}</GmailLayout>;
};

StarredMailDetail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default StarredMailDetail;
