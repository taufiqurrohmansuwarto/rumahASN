import { Alert, Button, Stack, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { adminDashboard } from "../../services/admin.services";
import AdminLayout from "../../src/components/AdminLayout";
import PageContainer from "../../src/components/PageContainer";
import { StatsGrid } from "../../src/components/StatsGrid";

const Dashboard = () => {
  const { data, isLoading } = useQuery(["dashboard-admin"], () =>
    adminDashboard()
  );

  const { data: userData, status } = useSession();

  return (
    <PageContainer loading={isLoading || status === "loading"}>
      <Stack>
        <Alert title="Perhatian">
          <Text mb={10}>Halo Admin, {userData?.user?.name}</Text>

          <Button
            component="a"
            href="/helpdesk/api/admins/reports"
            variant="filled"
            color="green"
          >
            Simple Report
          </Button>
        </Alert>
        <StatsGrid data={data} />
      </Stack>
    </PageContainer>
  );
};

Dashboard.getLayout = function getLayout(page) {
  return <AdminLayout active="/admin/dashboard">{page}</AdminLayout>;
};

Dashboard.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Dashboard;
