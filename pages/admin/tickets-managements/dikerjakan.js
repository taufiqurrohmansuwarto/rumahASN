import AdminLayout from "../../../src/components/AdminLayout";

const {
  default: PageContainer,
} = require("../../../src/components/PageContainer");

const SudahDikerjakan = () => {
  return (
    <PageContainer>
      <div>hello world</div>
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
