import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Result } from "antd";
import { lowerCase } from "lodash";
import { useRouter } from "next/router";
import { detailTicket } from "../../../../services/admin.services";
import AdminAssignAgent from "../../../../src/components/AdminAssignAgent";
import AdminLayout from "../../../../src/components/AdminLayout";
import CustomerAdminAgent from "../../../../src/components/CustomerAdminAgent";
import { DetailTicket } from "../../../../src/components/DetailTicket";
import TimelinePekerjaan from "../../../../src/components/TimelinePekerjaan";
import { statusTicket } from "../../../../utils";

const {
  default: PageContainer,
} = require("../../../../src/components/PageContainer");

const Tombol = ({ data }) => {
  if (data?.status_code === "DIAJUKAN") {
    return [<AdminAssignAgent key="admin assign" id={data?.id} />];
  }
};

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
      <Result
        status={statusTicket(data?.status_code)}
        title={`Status tiket ${lowerCase(data?.status_code)}`}
        subTitle={`Tiket ini berstatus ${lowerCase(data?.status_code)}`}
        extra={Tombol({ data })}
      >
        <Stack>
          <DetailTicket data={data} />
          <TimelinePekerjaan data={data} />
          <CustomerAdminAgent data={data} />
        </Stack>
      </Result>
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
