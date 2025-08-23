import KnowledgeAdminBadges from "@/components/KnowledgeManagements/admins/KnowledgeAdminBadges";
import KnowledgeManagementLayout from "@/components/KnowledgeManagements/KnowledgeManagementsLayout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb, Grid } from "antd";
import Link from "next/link";
import Head from "next/head";

function KnowledgeManagementBadges() {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Manajemen Pengetahuan - Badges</title>
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
              <Breadcrumb.Item>Badges</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Badges"
        content="Badges"
      >
        <KnowledgeAdminBadges />
      </PageContainer>
    </>
  );
}

KnowledgeManagementBadges.getLayout = function getLayout(page) {
  return (
    <KnowledgeManagementLayout active="/knowledge-managements/badges">
      {page}
    </KnowledgeManagementLayout>
  );
};

KnowledgeManagementBadges.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default KnowledgeManagementBadges;
