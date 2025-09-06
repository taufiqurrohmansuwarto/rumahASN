import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import HybridRevisionView from "@/components/KnowledgeManagements/components/HybridRevisionView";
import { useRevisionDetails, useUserOwnContent } from "@/hooks/knowledge-management";
import { Breadcrumb, FloatButton } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const RevisionViewPage = () => {
  const router = useRouter();
  const { id: contentId, versionId } = router.query;
  const { data: session } = useSession();

  // Fetch revision details (pass contentId for user endpoint)
  const { data: revisionData, isLoading: isLoadingRevision } = useRevisionDetails(versionId, contentId);
  
  // Fetch original content for reference
  const { data: originalContent } = useUserOwnContent(contentId);

  const formatVersion = (version) => {
    return version ? `v${version}` : "Draft";
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Revisi Pengetahuan</title>
      </Head>
      <PageContainer
        loading={isLoadingRevision}
        title={`Revisi ${formatVersion(revisionData?.revision?.current_version)}`}
        onBack={() => router.back()}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/asn-connect/asn-knowledge/my-knowledge">
                  ASNPedia
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link
                  href={`/asn-connect/asn-knowledge/my-knowledge/${contentId}`}
                >
                  {originalContent?.title || "Konten"}
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                Revisi {formatVersion(revisionData?.revision?.current_version)}
              </Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <FloatButton.BackTop />
        
        {/* Hybrid Revision View Component */}
        <HybridRevisionView
          revisionData={revisionData}
          contentId={contentId}
          versionId={versionId}
          currentUser={session?.user}
        />
      </PageContainer>
    </>
  );
};

RevisionViewPage.Auth = {
  action: "manage",
  subject: "tickets",
};

RevisionViewPage.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default RevisionViewPage;