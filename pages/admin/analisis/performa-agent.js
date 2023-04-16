import PageContainer from "@/components/PageContainer";

const { default: AdminLayout } = require("@/components/AdminLayout");

const PerformaAgent = () => {
  return (
    <PageContainer title="Analisis Performa Penerima Tugas"></PageContainer>
  );
};

PerformaAgent.getLayout = function getLayout(page) {
  return <AdminLayout active="/admin/analisis">{page}</AdminLayout>;
};

PerformaAgent.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default PerformaAgent;
