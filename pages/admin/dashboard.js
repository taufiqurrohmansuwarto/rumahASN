import AdminLayout from "../../src/components/AdminLayout";

const Dashboard = () => {
  return <div>dashboard</div>;
};

Dashboard.getLayout = function getLayout(page) {
  return <AdminLayout active="/admin/dashboard">{page}</AdminLayout>;
};

Dashboard.Auth = {
  action: "manage",
  subject: "Dashboard",
};

export default Dashboard;
