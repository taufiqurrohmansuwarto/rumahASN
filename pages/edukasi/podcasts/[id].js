import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import PodcastPlayer from "@/components/PodcastPlayer";
import { podcastUserDetail } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, Divider, Row, Tabs, Typography } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

function PodcastUserDetail() {
  const router = useRouter();
  const id = router?.query?.id;
  const { data, isLoading } = useQuery(
    ["podcast-user", id],
    () => podcastUserDetail(id),
    {
      refetchOnWindowFocus: false,
    }
  );
  return (
    <>
      <Head>
        <title>Rumah ASN - Podcast {data?.title}</title>
      </Head>
      <PageContainer
        onBack={() => router.back()}
        title="Detail Podcast"
        subTitle={`Epiosde ${data?.episode} • ${data?.title}`}
        loading={isLoading}
      >
        <Row>
          <Col md={18} xs={24}>
            <Card>
              <PodcastPlayer data={data} url={data?.audio_url} />
              <Divider />
              <Typography.Title level={3}>Deskripsi</Typography.Title>
              <div
                dangerouslySetInnerHTML={{
                  __html: data?.html,
                }}
              />
              <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab="Transkrip" key="1">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: data?.transcript_html,
                    }}
                  />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Komentar" key="2">
                  Akan ditambahkan komentar
                </Tabs.TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </PageContainer>
    </>
  );
}

PodcastUserDetail.getLayout = (page) => {
  return <Layout active="/edukasi/podcasts">{page}</Layout>;
};

PodcastUserDetail.Auth = {
  action: "manage",
  subject: "tickets",
};

export default PodcastUserDetail;
