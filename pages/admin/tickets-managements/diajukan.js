import AdminLayout from "../../../src/components/AdminLayout";
import AdminTickets from "../../../src/components/AdminTickets";
import AdminTIketDiajukan from "../../../src/components/AdminTiketDiajukan";

const {
  default: PageContainer,
} = require("../../../src/components/PageContainer");

const BelumDikerjakan = () => {
  return (
    <PageContainer>
      <AdminTIketDiajukan />
    </PageContainer>
  );
};

BelumDikerjakan.Auth = {
  action: "manage",
  subject: "Tickets",
};

BelumDikerjakan.getLayout = function (page) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default BelumDikerjakan;
