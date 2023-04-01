const { default: AdminLayout } = require("@/components/AdminLayout");

const PerformaAgent = () => {
  return (
    <div>
      <h1>Performa Agent</h1>
    </div>
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
