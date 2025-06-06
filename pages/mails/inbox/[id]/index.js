import PageContainer from "@/components/PageContainer";
import { useGetEmailWithThread } from "@/hooks/useEmails";
import { Empty, Spin } from "antd";

import GmailLayout from "@/components/GmailLayout";
import EmailDetailComponent from "@/components/mail/Detail/EmailDetailComponent";
import EmailThreadComponent from "@/components/mail/Detail/EmailThreadComponent";
import { useRouter } from "next/router";
import { Grid } from "antd";

const InboxMailDetail = () => {
  const router = useRouter();
  const breakPoint = Grid.useBreakpoint();
  const { id } = router.query;

  // ✅ Use thread-aware hook
  const {
    data: emailData,
    isLoading,
    error,
    refetch,
  } = useGetEmailWithThread(id);

  const handleReply = (originalEmail) => {
    // Open compose modal with reply context
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

  const { email, thread, has_thread } = emailData.data;

  return (
    <PageContainer
      onBack={() => router.back()}
      childrenContentStyle={{
        padding: breakPoint.xs ? null : 0,
      }}
    >
      {/* Email Thread Component */}
      {has_thread && (
        <EmailThreadComponent
          emailId={id}
          threadData={thread}
          onReply={handleReply}
          onReplyAll={handleReplyAll}
          onForward={handleForward}
        />
      )}

      {/* Regular Email Detail - hanya jika tidak ada thread */}
      {!has_thread && (
        <EmailDetailComponent
          email={email}
          loading={isLoading}
          error={error}
          onRefresh={refetch}
        />
      )}
    </PageContainer>
  );
};

InboxMailDetail.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/inbox">{page}</GmailLayout>;
};

InboxMailDetail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default InboxMailDetail;
