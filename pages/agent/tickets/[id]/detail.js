import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "antd";
import { useRouter } from "next/router";
import { detailTicket } from "../../../../services/agents.services";
import ActiveLayout from "../../../../src/components/ActiveLayout";
import AgentKerjakan from "../../../../src/components/AgentKerjakan";
import AgentLayout from "../../../../src/components/AgentLayout";
import AgentTicketDetail from "../../../../src/components/AgentTicketDetail";

const TicketsDetail = () => {
  const router = useRouter();
  const { data, isLoading } = useQuery(
    ["agent-tickets", router?.query?.id],
    () => detailTicket(router?.query?.id)
  );

  return (
    <ActiveLayout role="agent" id={router?.query?.id}>
      <Skeleton loading={isLoading}>
        {data?.status_code === "DIAJUKAN" && data?.chooser ? (
          <AgentKerjakan data={data} />
        ) : (
          <AgentTicketDetail data={data} />
        )}
      </Skeleton>
    </ActiveLayout>
  );
};

TicketsDetail.getLayout = (page) => {
  return <AgentLayout active="/agent/tickets">{page}</AgentLayout>;
};

TicketsDetail.Auth = {
  action: "read",
  subject: "DashboardAgent",
};

export default TicketsDetail;
