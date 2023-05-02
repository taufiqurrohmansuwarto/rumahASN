import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import SelamatDatang from "@/components/SelamatDatang";
import ShowRatings from "@/components/ShowRatings";
import PinnedTickets from "@/components/Ticket/PinnedTickets";
import TicketsPublish from "@/components/Ticket/TicketsPublish";
import PublikasiCASN from "@/components/Web/PublikasiCASN";
import { Grid, Stack } from "@mantine/core";
import { Card } from "antd";
import Head from "next/head";

function Feeds() {
  return (
    <PageContainer title="Beranda" subTitle="Dashboard">
      <Head>
        <title>Rumah ASN - Beranda</title>
      </Head>
      <ShowRatings />
      <Grid justify="start">
        <Grid.Col md={8} sm={12}>
          <Card>
            <Stack>
              <SelamatDatang />
              <PinnedTickets />
              <TicketsPublish />
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col md={4} sm={12}>
          <Grid>
            <Grid.Col md={12} xs={12}>
              <PublikasiCASN />
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
