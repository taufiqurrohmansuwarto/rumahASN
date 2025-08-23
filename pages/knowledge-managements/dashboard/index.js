import KnowledgeAdminDashboard from "@/components/KnowledgeManagements/admins/KnowledgeAdminDashboard";
import KnowledgeManagementLayout from "@/components/KnowledgeManagements/KnowledgeManagementsLayout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";

function KnowledgeManagementDashboard() {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Pengetahuan - Dashboard</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint?.xs ? 0 : null,
        }}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Pengetahuan"
        content="Pengetahuan"
      >
        <KnowledgeAdminDashboard />
      </PageContainer>
    </>
  );
}

KnowledgeManagementDashboard.getLayout = function getLayout(page) {
  return (
    <KnowledgeManagementLayout active="/knowledge-managements/dashboard">
      {page}
    </KnowledgeManagementLayout>
  );
};

KnowledgeManagementDashboard.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default KnowledgeManagementDashboard;
