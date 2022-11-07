import { useQuery } from "@tanstack/react-query";
import { dashboardAgents } from "../../../services/agents.services";

function DashboardsAgents() {
  const { data, isLoading } = useQuery(["agent-dashboard"], () =>
    dashboardAgents()
  );
  return <div>{JSON.stringify(data)}</div>;
}

export default DashboardsAgents;
