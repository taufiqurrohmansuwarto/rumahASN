import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import UserPolls from "@/components/Polls/UserPolls";
import UserQuiz from "@/components/Quiz/UserQuiz";
import ShowRatings from "@/components/ShowRatings";
import TicketsPublish from "@/components/Ticket/TicketsPublish";
import CarouselBanner from "@/components/Utils/CarouselBanner";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Grid, Stack } from "@mantine/core";
import { Grid as GridAntd } from "antd";
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
      <ShowRatings />
      <Grid justify="start" gutter={16}>
        <Grid.Col md={8} sm={12}>
          <Grid gutter={16}>
            <Grid.Col md={12} xs={12}>
              <CarouselBanner />
            </Grid.Col>
            <Grid.Col md={12} xs={12}>
              <TicketsPublish />
            </Grid.Col>
          </Grid>
        </Grid.Col>
        <Grid.Col md={4} sm={12}>
          <Grid>
            <Grid.Col md={12} xs={12}>
              <Stack>
                <UserQuiz />
                <UserPolls />
              </Stack>
            </Grid.Col>
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
