import KnowledgeManagementLayout from "@/components/KnowledgeManagements/KnowledgeManagementsLayout";
import PageContainer from "@/components/PageContainer";
import KnowledgeAdminMissions from "@/components/KnowledgeManagements/admins/KnowledgeAdminMissions";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";

function KnowledgeManagementMissions() {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Manajemen Pengetahuan - Missions</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint?.xs ? 0 : null,
        }}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/knowledge-managements">Manajemen Pengetahuan</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Missions</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Missions"
        content="Missions"
      >
        <KnowledgeAdminMissions />
      </PageContainer>
    </>
  );
}

KnowledgeManagementMissions.getLayout = function getLayout(page) {
  return (
    <KnowledgeManagementLayout active="/knowledge-managements/missions">
      {page}
    </KnowledgeManagementLayout>
  );
};

KnowledgeManagementMissions.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default KnowledgeManagementMissions;
