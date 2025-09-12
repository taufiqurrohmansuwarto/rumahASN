import { KnowledgeUserContentDetail } from "@/components/KnowledgeManagements";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { useUserOwnContent } from "@/hooks/knowledge-management";
import { Breadcrumb, Col, FloatButton, Row } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const AsnKnowledgeMyKnowledgeDetail = () => {
  const router = useRouter();

  const { data, isLoading } = useUserOwnContent(router.query.id);

  const url = `/asn-connect/asn-knowledge/my-knowledge`;

  return (
    <>
      <Head>
        <title>Rumah ASN - Detail Pengetahuan Saya</title>
      </Head>
      <PageContainer
        loading={isLoading}
        title={`${data?.title} - ASNPedia`}
        onBack={() => router.push(url)}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/asn-connect/asn-knowledge/my-knowledge">
                  Pengetahuan Saya
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link
                  href={`/asn-connect/asn-knowledge/my-knowledge?category=${data?.category?.id}`}
                >
                  {data?.category?.name || "Kategori"}
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {data?.title || "Detail Pengetahuan Saya"}
              </Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <FloatButton.BackTop />
        <Row>
          <Col lg={18} xs={24}>
            <KnowledgeUserContentDetail
              data={data}
              disableInteractions={data?.status !== "published"}
              showOwnerActions={true}
            />
          </Col>
        </Row>
      </PageContainer>
    </>
  );
};

AsnKnowledgeMyKnowledgeDetail.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnKnowledgeMyKnowledgeDetail.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default AsnKnowledgeMyKnowledgeDetail;
