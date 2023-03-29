import SelamatDatang from "@/components/SelamatDatang";
import PinnedTickets from "@/components/Ticket/PinnedTickets";
import TicketsPublish from "@/components/Ticket/TicketsPublish";
import { Grid, Stack } from "@mantine/core";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import PublikasiCASN from "@/components/Web/PublikasiCASN";

function Feeds() {
  return (
    <PageContainer title="Beranda" subTitle="Dashboard">
      <Grid justify="start">
        <Grid.Col md={9} sm={12}>
          <Stack>
            <SelamatDatang />
            <PinnedTickets />
            <TicketsPublish />
          </Stack>
        </Grid.Col>
        <Grid.Col md={3} sm={12}>
          <PublikasiCASN />
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
