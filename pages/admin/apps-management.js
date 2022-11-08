import AdminLayout from "../../src/components/AdminLayout";
import PageContainer from "../../src/components/PageContainer";

const Dashboard = () => {
  return (
    <PageContainer>
      <div>Features is on going</div>
    </PageContainer>
  );
};

Dashboard.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

Dashboard.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Dashboard;
