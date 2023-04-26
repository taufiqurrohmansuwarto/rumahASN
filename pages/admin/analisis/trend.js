import PageContainer from "@/components/PageContainer";
import { trends } from "@/services/admin.services";
import { useQuery } from "@tanstack/react-query";

const { default: AdminLayout } = require("@/components/AdminLayout");

const Trend = () => {
  const { data, isLoading } = useQuery(["analysis-trends"], () => trends(), {
    refetchOnWindowFocus: false,
  });
  return (
    <PageContainer title="Analisis Trend" loading={isLoading}>
      {JSON.stringify(data)}
    </PageContainer>
  );
};

Trend.getLayout = function getLayout(page) {
  return <AdminLayout active="/admin/analisis">{page}</AdminLayout>;
};

Trend.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Trend;
