import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import UserPolls from "@/components/Polls/UserPolls";
import CekPertek from "@/components/Public/CekPertek";
import UserQuiz from "@/components/Quiz/UserQuiz";
import ShowRatings from "@/components/ShowRatings";
import TicketsPublish from "@/components/Ticket/TicketsPublish";
import CarouselBanner from "@/components/Utils/CarouselBanner";
import EletterBKD from "@/components/Utils/EletterBKD";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Grid, Stack } from "@mantine/core";
import { Card, Grid as GridAntd } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

function Feeds() {
  const router = useRouter();

  // Gunakan scroll restoration hook dengan storage key khusus untuk feeds
  useScrollRestoration("feedsScrollPosition");

  const breakPoint = GridAntd.useBreakpoint();

  return (
    <PageContainer
      title="Forum Kepegawaian Rumah ASN"
      content="Kamu bertanya kami menjawab!"
      childrenContentStyle={{
        padding: breakPoint.xs ? 0 : null,
      }}
    >
      <Head>
        <title>Rumah ASN - Beranda</title>
      </Head>
      <EletterBKD right={50} />
      <ShowRatings />
      <Grid justify="start">
        <Grid.Col md={12} sm={12}></Grid.Col>
        <Grid.Col md={8} sm={12}>
          <CarouselBanner />
          <Card
            title="Daftar Pertanyaan BKD"
            style={{
              marginTop: 14,
            }}
            extra={<CekPertek />}
          >
            <Stack>
              <TicketsPublish />
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col md={4} sm={12}>
          <Grid>
            <Grid.Col md={12} xs={12}>
              <Stack>
                <UserQuiz />
                <UserPolls />
              </Stack>
            </Grid.Col>
            <Grid.Col md={12} xs={12}></Grid.Col>
          </Grid>
        </Grid.Col>
      </Grid>
    </PageContainer>
  );
}

Feeds.Auth = {
  action: "manage",
  subject: "Feeds",
};

Feeds.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default Feeds;
