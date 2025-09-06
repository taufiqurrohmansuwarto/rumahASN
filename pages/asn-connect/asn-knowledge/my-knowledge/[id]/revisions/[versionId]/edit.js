import { RevisionForm } from "@/components/KnowledgeManagements";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { 
  useRevisionDetails, 
  useUpdateRevision, 
  useSubmitRevision,
  useUserOwnContent 
} from "@/hooks/knowledge-management";
import { Breadcrumb, FloatButton } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const RevisionEditPage = () => {
  const router = useRouter();
  const { id: contentId, versionId } = router.query;

  // Fetch revision details
  const { data: revisionData, isLoading: isLoadingRevision } = useRevisionDetails(versionId);
  
  // Fetch original content for reference
  const { data: originalContent } = useUserOwnContent(contentId);

  // Mutations
  const updateRevisionMutation = useUpdateRevision();
  const submitRevisionMutation = useSubmitRevision();

  // Handle save draft
  const handleSave = (formData) => {
    if (!contentId || !versionId) return;
    
    updateRevisionMutation.mutate({
      contentId,
      versionId,
      data: formData
    });
  };

  // Handle submit for review
  const handleSubmit = (formData) => {
    if (!contentId || !versionId) return;
    
    // First update the revision with new data
    updateRevisionMutation.mutate({
      contentId,
      versionId,
      data: formData
    }, {
      onSuccess: () => {
        // Then submit for review
        submitRevisionMutation.mutate({
          contentId,
          versionId,
          submitNotes: formData.changeNotes || ""
        }, {
          onSuccess: () => {
            // Navigate back to content detail
            router.push(`/asn-connect/asn-knowledge/my-knowledge/${contentId}`);
          }
        });
      }
    });
  };

  // Handle cancel
  const handleCancel = () => {
    router.push(`/asn-connect/asn-knowledge/my-knowledge/${contentId}`);
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Edit Revisi Pengetahuan</title>
      </Head>
      <PageContainer
        loading={isLoadingRevision}
        title={`Edit Revisi v${revisionData?.version || 'Draft'}`}
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
                Edit Revisi v{revisionData?.version || 'Draft'}
              </Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <FloatButton.BackTop />
        {revisionData && (
          <RevisionForm
            initialData={revisionData}
            originalContent={originalContent}
            onSave={handleSave}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoadingRevision}
            isSaving={updateRevisionMutation.isLoading}
            isSubmitting={submitRevisionMutation.isLoading}
          />
        )}
      </PageContainer>
    </>
  );
};

RevisionEditPage.Auth = {
  action: "manage",
  subject: "tickets",
};

RevisionEditPage.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default RevisionEditPage;