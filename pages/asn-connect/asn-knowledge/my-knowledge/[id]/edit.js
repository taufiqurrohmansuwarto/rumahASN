import KnowledgeFormUserContents from "@/components/KnowledgeManagements/forms/KnowledgeFormUserContents";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { useUserOwnContent, useEditMyContent } from "@/hooks/knowledge-management";
import { Breadcrumb, FloatButton } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const AsnKnowledgeMyKnowledgeDetailEdit = () => {
  const router = useRouter();
  const { id } = router.query;

  // Fetch content data for editing
  const { data, isLoading } = useUserOwnContent(id);
  
  // Get edit mutation hook
  const editMutation = useEditMyContent();

  // Handle successful edit
  const handleEditSuccess = (updatedContent) => {
    // Navigate back to detail page
    router.push(`/asn-connect/asn-knowledge/my-knowledge/${id}?category=${updatedContent?.category?.id || data?.category?.id}`);
  };

  // Handle cancel
  const handleCancel = () => {
    router.back();
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Detail Pengetahuan Saya</title>
      </Head>
      <PageContainer
        loading={isLoading}
        title={`Edit - ${data?.title || 'Pengetahuan Saya'}`}
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
                  href={`/asn-connect/asn-knowledge/my-knowledge/${data?.id}?category=${data?.category?.id}`}
                >
                  {data?.category?.name || "Kategori"}
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                Edit - {data?.title || "Pengetahuan Saya"}
              </Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <FloatButton.BackTop />
        {data && (
          <KnowledgeFormUserContents
            initialData={data}
            onSuccess={handleEditSuccess}
            onCancel={handleCancel}
            mode="user"
            queryKeysToInvalidate={["user-own-contents", "user-own-content"]}
            customTitle="Edit Pengetahuan Saya"
            customSubtitle="Perbarui informasi dan konten pengetahuan Anda"
            useUpdateMutation={() => editMutation}
          />
        )}
      </PageContainer>
    </>
  );
};

AsnKnowledgeMyKnowledgeDetailEdit.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnKnowledgeMyKnowledgeDetailEdit.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default AsnKnowledgeMyKnowledgeDetailEdit;
