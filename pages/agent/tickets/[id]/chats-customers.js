import { Card } from "antd";
import { useRouter } from "next/router";
import ActiveLayout from "../../../../src/components/ActiveLayout";
import AgentLayout from "../../../../src/components/AgentLayout";
import ChatCustomerToAgent from "../../../../src/components/ChatCustomerToAgent";

const AgentsChatsCustomers = () => {
  const router = useRouter();

  return (
    <ActiveLayout id={router?.query?.id} role="agent" active="chats-customers">
      <Card title="Chats Customers">
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
