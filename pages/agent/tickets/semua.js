import AgentLayout from "../../../src/components/AgentLayout";
import AgentsTickets from "../../../src/components/AgentsTickets";

const Tickets = () => {
  return <AgentsTickets status="SEMUA" />;
};

Tickets.getLayout = (page) => {
  return <AgentLayout title="Tiket Agent">{page}</AgentLayout>;
};

Tickets.Auth = {
  action: "read",
  subject: "DashboardAgent",
};

export default Tickets;
