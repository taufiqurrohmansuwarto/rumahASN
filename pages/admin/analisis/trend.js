const { default: AdminLayout } = require("@/components/AdminLayout");

const Trend = () => {
  return (
    <div>
      <h1>Kecepatan Respons</h1>
    </div>
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
