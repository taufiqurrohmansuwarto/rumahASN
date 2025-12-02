import PageContainer from "@/components/PageContainer";
import { useGetEmailWithThread } from "@/hooks/useEmails";
import { Breadcrumb, Empty, Grid, Spin } from "antd";

import GmailLayout from "@/components/GmailLayout";
import EmailDetailComponent from "@/components/mail/Detail/EmailDetailComponent";
import EmailThreadComponent from "@/components/mail/Detail/EmailThreadComponent";
import Link from "next/link";
import { useRouter } from "next/router";

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
      title="Detail Pesan"
      subTitle={email?.subject}
      onBack={() => router.back()}
      breadcrumbRender={() => (
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/feeds">Beranda</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href="/mails/inbox">Kotak Masuk</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Detail</Breadcrumb.Item>
        </Breadcrumb>
      )}
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
