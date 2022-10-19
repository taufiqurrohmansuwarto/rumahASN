import AdminLayout from "../../../src/components/AdminLayout";
import AdminTickets from "../../../src/components/AdminTickets";

const {
  default: PageContainer,
} = require("../../../src/components/PageContainer");

const SemuaTicket = () => {
  return (
    <PageContainer>
      <AdminTickets />
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
