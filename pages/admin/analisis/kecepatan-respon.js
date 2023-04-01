const { default: AdminLayout } = require("@/components/AdminLayout");

const KecepatanRespons = () => {
  return (
    <div>
      <h1>Kecepatan Respons</h1>
    </div>
  );
};

KecepatanRespons.getLayout = function getLayout(page) {
  return <AdminLayout active="/admin/analisis">{page}</AdminLayout>;
};

KecepatanRespons.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default KecepatanRespons;
