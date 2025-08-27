import {
  MyKnowledgeContents,
  KnowledgeLayout,
} from "@/components/KnowledgeManagements";
import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Col, FloatButton, Row } from "antd";
import Head from "next/head";

const AsnKnowledgeMyKnowledge = () => {
  useScrollRestoration("my-knowledge-scroll", true, false, true); // Enable smooth restoration

  return (
    <>
      <Head>
        <title>Rumah ASN - Pojok Pengetahuan - Pengetahuan Saya</title>
      </Head>
      <LayoutASNConnect active="asn-knowledge">
        <Row>
          <Col lg={18} xs={24}>
            <FloatButton.BackTop />
            <KnowledgeLayout currentPath="/asn-connect/asn-knowledge/my-knowledge">
              <MyKnowledgeContents />
            </KnowledgeLayout>
          </Col>
        </Row>
      </LayoutASNConnect>
    </>
  );
};

AsnKnowledgeMyKnowledge.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnKnowledgeMyKnowledge.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default AsnKnowledgeMyKnowledge;
