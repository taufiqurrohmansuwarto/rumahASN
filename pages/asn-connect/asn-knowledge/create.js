import { KnowledgeFormUserContents } from "@/components/KnowledgeManagements";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const AsnKnowledgeCreate = () => {
  const router = useRouter();

  const handleSuccess = (createdContent) => {
    // Redirect to detail page of newly created content
    if (createdContent?.id) {
      router.push(`/asn-connect/asn-knowledge/my-knowledge/${createdContent.id}`);
    } else {
      // Fallback to list page if no ID
      router.push("/asn-connect/asn-knowledge/my-knowledge");
    }
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Pojok Pengetahuan - Buat Pengetahuan</title>
      </Head>
      <PageContainer
        title="Buat Pengetahuan"
        onBack={() => router.back()}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/asn-connect/asn-knowledge">ASNPedia</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Buat Pengetahuan</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <KnowledgeFormUserContents onSuccess={handleSuccess} />
      </PageContainer>
    </>
  );
};

AsnKnowledgeCreate.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnKnowledgeCreate.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default AsnKnowledgeCreate;
