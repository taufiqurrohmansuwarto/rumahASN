import GmailLayout from "@/components/GmailLayout";
import EmailDetailComponent from "@/components/mail/Detail/EmailDetailComponent";
import EmailThreadComponent from "@/components/mail/Detail/EmailThreadComponent";
import PageContainer from "@/components/PageContainer";
import { useGetEmailWithThread } from "@/hooks/useEmails";
import { Breadcrumb, Empty, Grid, Spin } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const LabelMailDetail = () => {
  const router = useRouter();
  const { id: labelId, labelId: emailId } = router?.query;
  const breakPoint = Grid.useBreakpoint();

  const {
    data: emailData,
    isLoading,
    error,
    refetch,
  } = useGetEmailWithThread(emailId);

  const handleReply = (originalEmail) => {
    router.push(`/mails/compose?reply=${originalEmail.id}`);
  };

  const handleReplyAll = (originalEmail) => {
    router.push(`/mails/compose?reply=${originalEmail.id}&replyAll=true`);
  };

  const handleForward = (originalEmail) => {
    router.push(`/mails/compose?forward=${originalEmail.id}`);
  };

  if (isLoading) return <Spin />;
  if (error) return <Empty />;

  const { email, thread, has_thread } = emailData?.data || {};

  return (
    <>
      <Head>
        <title>{email?.subject} - Rumah ASN - Label</title>
      </Head>
      <PageContainer
        title="Detail Pesan"
        subTitle={email?.subject}
        onBack={() => router.back()}
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">Beranda</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href={`/mails/label/${labelId}`}>Label</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Detail</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        {/* Email Thread Component */}
        {has_thread && (
          <EmailThreadComponent
            emailId={emailId}
            threadData={thread}
            onReply={handleReply}
            onReplyAll={handleReplyAll}
            onForward={handleForward}
          />
        )}

        {/* Regular Email Detail */}
        {!has_thread && (
          <EmailDetailComponent
            email={email}
            loading={isLoading}
            error={error}
            onRefresh={refetch}
          />
        )}
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
