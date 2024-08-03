import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Bar from "@/components/Plots/Bar";
import { detailPolling } from "@/services/polls.services";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Card, Col, Grid, Row, Skeleton } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const DetailVote = () => {
  const router = useRouter();

  const { id } = router.query;

  const breakPoint = Grid.useBreakpoint();

  const handleBack = () => router?.back();

  const { data, isLoading } = useQuery(
    ["data-vote-dashboard", id],
    () => detailPolling(id, "dashboard"),
    {}
  );

  const config = {
    data: data?.answers,
    xField: "value",
    yField: "title",
    seriesField: "title",
    label: {
      position: "middle",
    },
    legend: { position: "top-left" },
  };

  return (
    <>
      <Head>
        <title>Detail Voting</title>
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
              <Breadcrumb.Item>
                <Link href="/apps-managements/votes">
                  <a>Polling</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Detail Polling</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Rumah ASN"
        content="Detail Polling"
        onBack={handleBack}
      >
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
                  <Bar {...config} />
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
