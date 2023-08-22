import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { detailPolling } from "@/services/polls.services";
import { Column } from "@ant-design/plots";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row, Skeleton } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const DetailVote = () => {
  const router = useRouter();

  const { id } = router.query;

  const handleBack = () => router?.back();

  const { data, isLoading } = useQuery(
    ["data-vote-dashboard", id],
    () => detailPolling(id, "dashboard"),
    {}
  );

  const config = {
    data: data?.answers,
    xField: "title",
    yField: "value",
    seriesField: "title",
    label: {
      // 可手动配置 label 数据标签位置
      position: "middle",
      // 'top', 'bottom', 'middle',
      // 配置样式
      style: {
        fill: "#FFFFFF",
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    legend: { position: "top-left" },
  };

  return (
    <>
      <Head>
        <title>Detail Voting</title>
      </Head>
      <PageContainer title="Detail Voting" onBack={handleBack}>
        <Skeleton loading={isLoading}>
          {data && (
            <Row
              style={{
                marginBottom: 8,
              }}
              gutter={[8, 8]}
            >
              <Col md={16} xs={24}>
                <Card title={data?.question}>
                  <Column {...config} />
                </Card>
              </Col>
            </Row>
          )}
        </Skeleton>
      </PageContainer>
    </>
  );
};

DetailVote.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

DetailVote.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default DetailVote;
