import KnowledgeAdminCategories from "@/components/KnowledgeManagements/admins/KnowledgeAdminCategories";
import KnowledgeManagementLayout from "@/components/KnowledgeManagements/KnowledgeManagementsLayout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb, Grid } from "antd";
import Link from "next/link";
import Head from "next/head";

function KnowledgeManagementCategories() {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Manajemen Pengetahuan - Kategori</title>
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
              <Breadcrumb.Item>Kategori</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Kategori"
        content="Kategori"
      >
        <KnowledgeAdminCategories />
      </PageContainer>
    </>
  );
}

KnowledgeManagementCategories.getLayout = function getLayout(page) {
  return (
    <KnowledgeManagementLayout active="/knowledge-managements/categories">
      {page}
    </KnowledgeManagementLayout>
  );
};

KnowledgeManagementCategories.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default KnowledgeManagementCategories;
