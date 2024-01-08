import { adminDashboard } from "@/services/admin.services";
import { useQuery } from "@tanstack/react-query";

function PlotVisitors() {
  const { data, isLoading } = useQuery(["analysis-visitors"], () =>
    adminDashboard("visitors")
  );

  return <div>{JSON.stringify(data)}</div>;
}

export default PlotVisitors;
