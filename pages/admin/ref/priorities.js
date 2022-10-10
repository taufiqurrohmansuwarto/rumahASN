const { default: AdminLayout } = require("../../../src/components/AdminLayout");
const {
  default: PageContainer,
} = require("../../../src/components/PageContainer");

const Priorities = () => {
  return <PageContainer>Prioritias</PageContainer>;
};

Priorities.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

Priorities.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Priorities;
