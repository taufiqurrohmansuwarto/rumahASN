const { default: AdminLayout } = require("../../../src/components/AdminLayout");
const {
  default: PageContainer,
} = require("../../../src/components/PageContainer");

const Status = () => {
  return <PageContainer>Hello</PageContainer>;
};

Status.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

Status.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Status;
