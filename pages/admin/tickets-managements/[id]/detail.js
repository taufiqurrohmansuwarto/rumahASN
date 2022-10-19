import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { detailTicket } from "../../../../services/admin.services";
import AdminAssignAgent from "../../../../src/components/AdminAssignAgent";
import AdminLayout from "../../../../src/components/AdminLayout";

const {
  default: PageContainer,
} = require("../../../../src/components/PageContainer");

const SemuaTicket = () => {
  const router = useRouter();

  return (
    <PageContainer>
      <AdminAssignAgent id={router?.query?.id} />
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
