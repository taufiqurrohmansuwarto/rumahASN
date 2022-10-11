import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../../services";
import AdminLayout from "../../src/components/AdminLayout";
import PageContainer from "../../src/components/PageContainer";

const Dashboard = () => {
  const { data, isLoading } = useQuery(["users"], () => getUsers());
  return (
    <PageContainer>
      <div>{JSON.stringify(data)}</div>
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
