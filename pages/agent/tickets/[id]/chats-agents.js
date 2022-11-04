import { useQuery } from "@tanstack/react-query";
import { Result } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { messagesAgents } from "../../../../services/agents.services";
import ActiveLayout from "../../../../src/components/ActiveLayout";
import AgentLayout from "../../../../src/components/AgentLayout";

const TicketsDetails = () => {
  const router = useRouter();
  const { data: dataUser, status } = useSession();

  const { data, isLoading } = useQuery(
    ["messages-agents-to-agents", router?.query?.id],
    () => messagesAgents(router?.query?.id)
  );

  return (
    <ActiveLayout
      loading={status === "loading" || isLoading}
      active="chats-agents"
      role="agent"
      id={router?.query?.id}
    >
      <Result status="403" title="Ooops..." subTitle="Fitur belum dikerjakan" />
    </ActiveLayout>
  );
};

TicketsDetails.getLayout = (page) => {
  return <AgentLayout active="/agent/tickets">{page}</AgentLayout>;
};

TicketsDetails.Auth = {
  action: "read",
  subject: "DashboardAgent",
};

export default TicketsDetails;
