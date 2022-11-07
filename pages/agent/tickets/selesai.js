import AgentLayout from "../../../src/components/AgentLayout";
import AgentsTickets from "../../../src/components/AgentsTickets";

const Tickets = () => {
  return <AgentsTickets status="SELESAI" />;
};

Tickets.getLayout = (page) => {
  return <AgentLayout>{page}</AgentLayout>;
};

Tickets.Auth = {
  action: "read",
  subject: "DashboardAgent",
};

export default Tickets;
