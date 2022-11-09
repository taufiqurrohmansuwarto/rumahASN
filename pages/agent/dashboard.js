import { Alert, Stack, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "antd";
import { useSession } from "next-auth/react";
import { dashboardAgents } from "../../services/agents.services";
import AgentLayout from "../../src/components/AgentLayout";
import DashboardsAgents from "../../src/components/Dashboards/DashboardsAgents";
import { StatsGrid } from "../../src/components/StatsGrid";

const {
  default: PageContainer,
} = require("../../src/components/PageContainer");

const Dashboard = () => {
  const { data: userData, status } = useSession();
  const { data, isLoading } = useQuery(["dashboard-agent"], () =>
    dashboardAgents()
  );

  return (
    <PageContainer loading={isLoading || status === "loading"}>
      <Stack>
        <Alert title="Perhatian">
          <Text>Halo Agent, {userData?.user?.name}</Text>
        </Alert>
        <StatsGrid data={data} />
      </Stack>
    </PageContainer>
  );
};

Dashboard.getLayout = (page) => {
  return <AgentLayout>{page}</AgentLayout>;
};

Dashboard.Auth = {
  action: "read",
  subject: "DashboardAgent",
};

export default Dashboard;
