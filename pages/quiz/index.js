import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import LeaderBoard from "@/components/Quiz/LeaderBoard";
import UserQuiz from "@/components/Quiz/UserQuiz";
import { Breadcrumb, Col, Grid, Row } from "antd";
import Head from "next/head";
import Link from "next/link";

function QuizKepegawaian() {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Quiz Kepegawaian</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Quiz Kepegawaian</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Quiz Kepegawaian"
        content="Tes Pengetahuan Kepegawaian mu!"
      >
        <Row gutter={[8, 8]} justify="center" align="center">
          <Col md={14} xs={24}>
            <UserQuiz />
          </Col>
          <Col md={14} xs={24}>
            <LeaderBoard />
          </Col>
        </Row>
      </PageContainer>
    </>
  );
}

QuizKepegawaian.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

QuizKepegawaian.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default QuizKepegawaian;
