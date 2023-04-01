const { default: AdminLayout } = require("@/components/AdminLayout");

const KepuasanPelanggan = () => {
  return (
    <div>
      <h1>Kepuasan Pelanggan</h1>
    </div>
  );
};

KepuasanPelanggan.getLayout = function getLayout(page) {
  return <AdminLayout active="/admin/analisis">{page}</AdminLayout>;
};

KepuasanPelanggan.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default KepuasanPelanggan;
