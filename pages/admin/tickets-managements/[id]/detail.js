import { useRouter } from "next/router";
import { detailTicket } from "../../../../services/admin.services";
import AdminAssignAgent from "../../../../src/components/AdminAssignAgent";
import AdminLayout from "../../../../src/components/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { DetailTicket } from "../../../../src/components/DetailTicket";
import { Paper, Stack } from "@mantine/core";
import TimelinePekerjaan from "../../../../src/components/TimelinePekerjaan";

const {
  default: PageContainer,
} = require("../../../../src/components/PageContainer");

const SemuaTicket = () => {
  const router = useRouter();

  const { id } = router.query;

  const { data, isLoading } = useQuery(
    ["admin-tickets", id],
    () => detailTicket(id),
    {}
  );

  return (
    <PageContainer loading={isLoading}>
      <AdminAssignAgent id={router?.query?.id} />
      <Stack>
        <DetailTicket data={data} />
        <TimelinePekerjaan data={data} />
      </Stack>
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
