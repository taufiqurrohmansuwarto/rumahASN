import DaftarLayanan from "@/components/LayananKepegawaian/DaftarLayanan";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import UserPolls from "@/components/Polls/UserPolls";
import UserQuiz from "@/components/Quiz/UserQuiz";
import ShowRatings from "@/components/ShowRatings";
import TicketsPublish from "@/components/Ticket/TicketsPublish";
import CarouselBanner from "@/components/Utils/CarouselBanner";
import { Grid, Stack } from "@mantine/core";
import { Card } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

function Feeds() {
  const router = useRouter();

  useEffect(() => {
    // On before route change save scroll position
    router.events.on("routeChangeStart", saveScrollPosition);
    // On route change restore scroll position
    router.events.on("routeChangeComplete", restoreScrollPosition);

    return () => {
      router.events.off("routeChangeStart", saveScrollPosition);
      router.events.off("routeChangeComplete", restoreScrollPosition);
    };
  }, [router]);

  function saveScrollPosition() {
    window.sessionStorage.setItem("scrollPosition", window.scrollY.toString());
  }

  function restoreScrollPosition() {
    const scrollY = window.sessionStorage.getItem("scrollPosition") ?? "0";
    window.scrollTo(0, parseInt(scrollY));
  }

  return (
    <PageContainer title="Beranda" subTitle="Rumah ASN">
      <Head>
        <title>Rumah ASN - Beranda</title>
      </Head>
      <ShowRatings />
      <Grid justify="start">
        <Grid.Col md={12} sm={12}></Grid.Col>
        <Grid.Col md={8} sm={12}>
          <CarouselBanner />
          <Card
            style={{
              marginTop: 14,
            }}
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
