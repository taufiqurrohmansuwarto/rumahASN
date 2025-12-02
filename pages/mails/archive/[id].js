import GmailLayout from "@/components/GmailLayout";
import EmailDetailComponent from "@/components/mail/Detail/EmailDetailComponent";
import PageContainer from "@/components/PageContainer";
import { useEmailById } from "@/hooks/useEmails";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const ArchiveMailDetail = () => {
  const breakPoint = Grid.useBreakpoint();
  const handleBack = () => router?.back();
  const router = useRouter();
  const { id } = router?.query;

  const { data: email, isLoading, error, refetch } = useEmailById(id);

  return (
    <>
      <Head>
        <title>{email?.data?.subject} - Rumah ASN - Pesan Arsip</title>
      </Head>
      <PageContainer
        title="Pesan Arsip"
        subTitle={email?.data?.subject}
        onBack={handleBack}
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">Beranda</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/mails/archive">Arsip</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Detail</Breadcrumb.Item>
          </Breadcrumb>
        )}
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

ArchiveMailDetail.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/archive">{page}</GmailLayout>;
};

ArchiveMailDetail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default ArchiveMailDetail;
