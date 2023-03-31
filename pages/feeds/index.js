import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import SelamatDatang from "@/components/SelamatDatang";
import PinnedTickets from "@/components/Ticket/PinnedTickets";
import TicketsPublish from "@/components/Ticket/TicketsPublish";
import PublikasiCASN from "@/components/Web/PublikasiCASN";
import { Grid, Stack } from "@mantine/core";

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
