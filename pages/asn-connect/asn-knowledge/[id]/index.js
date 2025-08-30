import { KnowledgeUserContentDetail } from "@/components/KnowledgeManagements";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { getKnowledgeContent } from "@/services/knowledge-management.services";
import { useQuery } from "@tanstack/react-query";
import { Col, FloatButton, Row, Breadcrumb } from "antd";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";

const AsnKnowledgeDetail = () => {
  const router = useRouter();

  const { data, isLoading } = useQuery(
    ["knowledge-content-detail", router.query.id],
    () => getKnowledgeContent(router.query.id),
    {
      enabled: !!router.query.id,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  return (
    <>
      <Head>
        <title>Rumah ASN - Detail Pengetahuan - {data?.title}</title>
      </Head>
      <Row>
        <Col lg={18} xs={24}>
          <FloatButton.BackTop />
          <PageContainer
            loading={isLoading}
            title={`${data?.title} - ASNPedia`}
            onBack={() => router.back()}
            header={{
              breadcrumbRender: () => (
                <Breadcrumb>
                  <Breadcrumb.Item>
                    <Link href="/asn-connect/asn-knowledge">ASNPedia</Link>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>
                    <Link
                      href={`/asn-connect/asn-knowledge?category=${data?.category?.id}`}
                    >
                      {data?.category?.name || "Kategori"}
                    </Link>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>
                    {data?.title || "Detail Pengetahuan"}
                  </Breadcrumb.Item>
                </Breadcrumb>
              ),
            }}
          >
            <KnowledgeUserContentDetail data={data} />
          </PageContainer>
        </Col>
      </Row>
    </>
  );
};

AsnKnowledgeDetail.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnKnowledgeDetail.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default AsnKnowledgeDetail;
