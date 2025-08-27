import { KnowledgeLayout } from "@/components/KnowledgeManagements";
import KnowledgeUserContents from "@/components/KnowledgeManagements/lists/KnowledgeUserContents";
import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import Head from "next/head";
import { Col, Row } from "antd";

const AsnKnowledge = () => {
  useScrollRestoration("knowledge-scroll", true, false, true); // Enable smooth restoration

  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Connect - Manajemen Pengetahuan</title>
      </Head>
      <LayoutASNConnect active="asn-knowledge">
        <Row>
          <Col lg={18} xs={24}>
            <KnowledgeLayout
              currentPath="/asn-connect/asn-knowledge"
              showCreateButton={true}
            >
              <KnowledgeUserContents />
            </KnowledgeLayout>
          </Col>
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
