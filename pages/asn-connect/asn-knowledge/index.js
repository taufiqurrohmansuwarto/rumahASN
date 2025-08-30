import { KnowledgeLayout } from "@/components/KnowledgeManagements";
import KnowledgeUserContents from "@/components/KnowledgeManagements/lists/KnowledgeUserContents";
import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import Head from "next/head";
import { Col, Row, Grid } from "antd";
import TopContributors from "@/components/KnowledgeManagements/TopContributors";
import TopContents from "@/components/KnowledgeManagements/TopContents";
import TopCategories from "@/components/KnowledgeManagements/TopCategories";
import TopTags from "@/components/KnowledgeManagements/TopTags";

const { useBreakpoint } = Grid;

const AsnKnowledge = () => {
  const breakPoint = useBreakpoint();

  const isMobile = breakPoint.xs;

  useScrollRestoration("knowledge-scroll", true, false, true); // Enable smooth restoration

  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Connect - Manajemen Pengetahuan</title>
      </Head>
      <LayoutASNConnect active="asn-knowledge">
        <Row gutter={[16, 16]}>
          <Col lg={16} xs={24}>
            <KnowledgeLayout
              currentPath="/asn-connect/asn-knowledge"
              showCreateButton={true}
            >
              <KnowledgeUserContents />
            </KnowledgeLayout>
          </Col>
          {!isMobile && (
            <Col lg={8} xs={24}>
              <Row gutter={[4, 4]}>
                <Col lg={24} xs={24}>
                  <TopContributors period="month" limit={10} />
                </Col>
                <Col lg={24} xs={24}>
                  <TopContents period="week" sortBy="engagement" />
                </Col>
                <Col lg={24} xs={24}>
                  <TopCategories period="month" />
                </Col>
                <Col lg={24} xs={24}>
                  <TopTags period="month" limit={10} />
                </Col>
              </Row>
            </Col>
          )}
        </Row>
      </LayoutASNConnect>
    </>
  );
};

AsnKnowledge.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnKnowledge.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default AsnKnowledge;
