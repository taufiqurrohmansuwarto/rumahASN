import AgentLayout from "../../src/components/AgentLayout";

const {
  default: PageContainer,
} = require("../../src/components/PageContainer");

const Dashboard = () => {
  return (
    <PageContainer>
      <div>Hello world</div>
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
