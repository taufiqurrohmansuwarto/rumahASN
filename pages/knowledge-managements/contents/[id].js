import KnowledgeManagementLayout from "@/components/KnowledgeManagements/KnowledgeManagementsLayout";
import KnowledgeAdminContentDetail from "@/components/KnowledgeManagements/admins/KnowledgeAdminContentDetail";
import KnowledgeAnchorNavigation from "@/components/KnowledgeManagements/components/KnowledgeAnchorNavigation";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { getAdminKnowledgeContentDetail } from "@/services/knowledge-management.services";
import { useQuery } from "@tanstack/react-query";
import { Col, FloatButton, Row, Breadcrumb, Grid } from "antd";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";

/**
 * Admin Knowledge Management Content Detail Page
 * Uses user-like layout but preserves admin functionality
 * Features:
 * - Clean user-style layout with PageContainer
 * - Left content area for admin detail component
 * - Right sidebar with anchor navigation
 * - Admin-specific breadcrumbs and functionality
 */
function KnowledgeManagementContentDetail() {
  const router = useRouter();
  const breakpoint = Grid.useBreakpoint();
  const isMobile = breakpoint.xs;

  // Fetch admin content detail - preserving admin functionality
  const { data, isLoading } = useQuery(
    ["admin-knowledge-content-detail", router.query.id],
    () => getAdminKnowledgeContentDetail(router.query.id),
    {
      enabled: !!router.query.id,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  return (
    <>
      <Head>
        <title>Admin - Detail Konten ASNPedia - {data?.title}</title>
        <meta name="description" content="Detail Konten untuk Admin" />
      </Head>
      
      {/* Float button for better UX like user page */}
      <FloatButton.BackTop />
      
      {/* Use PageContainer like user page for consistent layout */}
      <PageContainer
        loading={isLoading}
        title={`${data?.title || "Detail Konten"} - Admin ASNPedia`}
        onBack={() => router.back()}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/knowledge-managements/contents">
                  Admin - Manajemen Konten
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {data?.category?.name && (
                  <Link
                    href={`/knowledge-managements/contents?category=${data?.category?.id}`}
                  >
                    {data?.category?.name}
                  </Link>
                )}
                {!data?.category?.name && "Kategori"}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {data?.title || "Detail Konten"}
              </Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        {/* Two-column layout like user page */}
        <Row gutter={[16, 16]}>
          {/* Left Column - Main Content with Admin Detail Component */}
          <Col lg={18} xs={24}>
            <KnowledgeAdminContentDetail 
              data={data} 
              isLoading={isLoading}
              // Pass admin-specific props to preserve functionality
              isAdminView={true}
            />
          </Col>
          
          {/* Right Column - Anchor Navigation (desktop only) */}
          <Col lg={6} xs={24}>
            {!isMobile && (
              <KnowledgeAnchorNavigation 
                // Admin-specific navigation sections
                sections={[
                  { id: "content-info", title: "Informasi Konten" },
                  { id: "content-status", title: "Status & Aksi" },
                  { id: "content-revisions", title: "Riwayat Revisi" },
                  { id: "content-body", title: "Isi Konten" },
                  { id: "content-attachments", title: "Lampiran" },
                  { id: "content-references", title: "Referensi" },
                  { id: "content-comments", title: "Komentar" },
                ]}
              />
            )}
          </Col>
        </Row>
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
