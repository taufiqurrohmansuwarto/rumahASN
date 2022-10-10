const { default: AdminLayout } = require("../../../src/components/AdminLayout");
const {
  default: PageContainer,
} = require("../../../src/components/PageContainer");

const Referensi = () => {
  return <PageContainer>Hello</PageContainer>;
};

Referensi.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

Referensi.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Referensi;
