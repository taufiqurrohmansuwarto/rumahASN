import KnowledgeManagementLayout from "@/components/KnowledgeManagements/KnowledgeManagementsLayout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import KnowledgeAdminContentDetail from "@/components/KnowledgeManagements/admins/KnowledgeAdminContentDetail";
import { useRouter } from "next/router";

function KnowledgeManagementContentDetail() {
  const breakPoint = Grid.useBreakpoint();
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Pengetahuan - Detail</title>
        <meta name="description" content="Detail Pengetahuan" />
      </Head>
      <PageContainer
        onBack={() => router.back()}
        childrenContentStyle={{
          padding: breakPoint?.xs ? 0 : null,
        }}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>Pengetahuan</Breadcrumb.Item>
              <Breadcrumb.Item>Detail Pengetahuan</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Detail Pengetahuan"
        content="Detail Pengetahuan"
      >
        <KnowledgeAdminContentDetail />
      </PageContainer>
    </>
  );
}

KnowledgeManagementContentDetail.getLayout = function getLayout(page) {
  return (
    <KnowledgeManagementLayout active="/knowledge-managements/contents">
      {page}
    </KnowledgeManagementLayout>
  );
};

KnowledgeManagementContentDetail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default KnowledgeManagementContentDetail;
