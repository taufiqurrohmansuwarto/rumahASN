import AdminLayout from "../../../src/components/AdminLayout";
import AdminTickets from "../../../src/components/AdminTickets";

const {
  default: PageContainer,
} = require("../../../src/components/PageContainer");

const TicketSelesai = () => {
  return (
    <PageContainer>
      <AdminTickets status="SELESAI" />
    </PageContainer>
  );
};

TicketSelesai.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

TicketSelesai.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default TicketSelesai;
