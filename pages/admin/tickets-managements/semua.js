import AdminLayout from "../../../src/components/AdminLayout";

const {
  default: PageContainer,
} = require("../../../src/components/PageContainer");

const SemuaTicket = () => {
  return (
    <PageContainer>
      <div>hello world</div>
    </PageContainer>
  );
};

SemuaTicket.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

SemuaTicket.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default SemuaTicket;
