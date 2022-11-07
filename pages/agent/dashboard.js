import { Skeleton } from "antd";
import SkeletonNode from "antd/lib/skeleton/Node";
import { useSession } from "next-auth/react";
import AgentLayout from "../../src/components/AgentLayout";
import DashboardsAgents from "../../src/components/Dashboards/DashboardsAgents";

const {
  default: PageContainer,
} = require("../../src/components/PageContainer");

const Dashboard = () => {
  const { data, status } = useSession();
  return (
    <PageContainer>
      <Skeleton loading={status === "loading"}>
        {JSON.stringify(data)}
        <DashboardsAgents />
      </Skeleton>
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
