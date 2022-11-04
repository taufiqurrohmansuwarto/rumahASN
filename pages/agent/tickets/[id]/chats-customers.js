import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { detailTicket } from "../../../../services/agents.services";
import ActiveLayout from "../../../../src/components/ActiveLayout";
import AgentLayout from "../../../../src/components/AgentLayout";
import ChatCustomerToAgent from "../../../../src/components/ChatCustomerToAgent";

const AgentsChatsCustomers = () => {
  const router = useRouter();

  const { data, isLoading } = useQuery(["agent-tickets", router.query.id], () =>
    detailTicket(router.query.id)
  );

  return (
    <ActiveLayout
      loading={isLoading}
      id={router?.query?.id}
      role="agent"
      active="chats-customers"
    >
      <ChatCustomerToAgent detailticket={data} id={router?.query?.id} />
    </ActiveLayout>
  );
};

AgentsChatsCustomers.getLayout = (page) => {
  return (
    <AgentLayout title="Chat users" active="/agent/tickets">
      {page}
    </AgentLayout>
  );
};

AgentsChatsCustomers.Auth = {
  action: "read",
  subject: "DashboardAgent",
};

export default AgentsChatsCustomers;
