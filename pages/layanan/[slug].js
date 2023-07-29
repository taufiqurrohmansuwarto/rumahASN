import DetailLayanan from "@/components/LayananKepegawaian/DetailLayanan";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { slugLayananKepegawaian } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { BackTop, Card, Col, Row } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const Service = () => {
  const router = useRouter();
  const { slug } = router.query;

  const { data, isLoading } = useQuery(
    ["layanan-kepegawaian", slug],
    () => slugLayananKepegawaian(slug),
    {}
  );

  const handleBack = () => router.back();

  return (
    <>
      <Head>
        <title>Rumah ASN - Layanan {slug}</title>
      </Head>
      <PageContainer
        title={`Layanan ${data?.name}`}
        loading={isLoading}
        onBack={handleBack}
      >
        <Row>
          <Col md={16} xs={24}>
            <Card>
              <BackTop />
              <DetailLayanan data={data} />
            </Card>
          </Col>
        </Row>
      </PageContainer>
    </>
  );
};

Service.Auth = {
  action: "manage",
  subject: "Feeds",
};

Service.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default Service;
