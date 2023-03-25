import SelamatDatang from "@/components/SelamatDatang";
import PinnedTickets from "@/components/Ticket/PinnedTickets";
import TicketsPublish from "@/components/Ticket/TicketsPublish";
import { Grid, Stack } from "@mantine/core";
import Layout from "../../src/components/Layout";
import PageContainer from "../../src/components/PageContainer";

function Feeds() {
  return (
    <PageContainer title="Beranda" subTitle="Dashboard">
      <Grid justify="start">
        <Grid.Col span={9}>
          <Stack>
            <SelamatDatang />
            <PinnedTickets />
            <TicketsPublish />
          </Stack>
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
