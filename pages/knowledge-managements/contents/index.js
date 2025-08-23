import KnowledgeManagementLayout from "@/components/KnowledgeManagements/KnowledgeManagementsLayout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb, Grid } from "antd";
import KnowledgeAdminContents from "@/components/KnowledgeManagements/admins/KnowledgeAdminContents";
import Head from "next/head";

function KnowledgeManagementContents() {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Pengetahuan - Konten</title>
        <meta name="description" content="Konten Pengetahuan" />
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint?.xs ? 0 : null,
        }}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>Pengetahuan</Breadcrumb.Item>
              <Breadcrumb.Item>Konten</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Konten Pengetahuan"
        content="Konten Pengetahuan"
      >
        <KnowledgeAdminContents />
      </PageContainer>
    </>
  );
}

KnowledgeManagementContents.getLayout = function getLayout(page) {
  return (
    <KnowledgeManagementLayout active="/knowledge-managements/contents">
      {page}
    </KnowledgeManagementLayout>
  );
};

KnowledgeManagementContents.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default KnowledgeManagementContents;
