import RestrictedContent from "@/components/RestrictedContent";
import TicketsPublish from "@/components/Ticket/TicketsPublish";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { customerDashboard } from "../../services/users.services";
import Layout from "../../src/components/Layout";
import PageContainer from "../../src/components/PageContainer";
import { StatsGrid } from "../../src/components/StatsGrid";
import DetailTicket from "../../src/components/Ticket/DetailTicket";

function Feeds() {
  const { data, isLoading } = useQuery(
    ["dashboard"],
    () => customerDashboard(),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <PageContainer
      loading={isLoading || status === "loading"}
      title="Beranda"
      subTitle="Dashboard"
    >
      <Stack>
        <TicketsPublish />
        {/* <StatsGrid data={data} /> */}
        {/* <DetailTicket /> */}
      </Stack>
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
