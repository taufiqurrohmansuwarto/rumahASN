import { useQuery } from "@tanstack/react-query";
import { Card } from "antd";
import { useRouter } from "next/router";
import { detailTicket } from "../../../../services/agents.services";
import ActiveLayout from "../../../../src/components/ActiveLayout";
import AgentLayout from "../../../../src/components/AgentLayout";
import ChatCustomerToAgent from "../../../../src/components/ChatCustomerToAgent";
import TicketProperties from "../../../../src/components/TicketProperties";

const AgentsChatsCustomers = () => {
  const router = useRouter();
  const { data, isLoading } = useQuery(
    ["agent-tickets", router?.query?.id],
    () => detailTicket()
  );

  return (
    <ActiveLayout id={router?.query?.id} role="agent" active="chats-customers">
      <Card loading={isLoading} title="Chats Customers">
        <TicketProperties data={data} />
        <ChatCustomerToAgent id={router?.query?.id} />
      </Card>
    </ActiveLayout>
  );
};

AgentsChatsCustomers.getLayout = (page) => {
  return <AgentLayout active="/agent/tickets">{page}</AgentLayout>;
};

AgentsChatsCustomers.Auth = {
  action: "read",
  subject: "DashboardAgent",
};

export default AgentsChatsCustomers;
