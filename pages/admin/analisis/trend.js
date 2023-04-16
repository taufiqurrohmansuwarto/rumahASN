import PageContainer from "@/components/PageContainer";

const { default: AdminLayout } = require("@/components/AdminLayout");

const Trend = () => {
  return <PageContainer title="Analisis Trend"></PageContainer>;
};

Trend.getLayout = function getLayout(page) {
  return <AdminLayout active="/admin/analisis">{page}</AdminLayout>;
};

Trend.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Trend;
