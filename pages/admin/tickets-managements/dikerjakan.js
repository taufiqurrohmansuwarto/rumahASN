import AdminLayout from "../../../src/components/AdminLayout";
import AdminTickets from "../../../src/components/AdminTickets";

const {
  default: PageContainer,
} = require("../../../src/components/PageContainer");

const SudahDikerjakan = () => {
  return (
    <PageContainer>
      <AdminTickets status="DIKERJAKAN" />
    </PageContainer>
  );
};

SudahDikerjakan.Auth = {
  action: "manage",
  subject: "Tickets",
};

SudahDikerjakan.getLayout = function (page) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default SudahDikerjakan;
