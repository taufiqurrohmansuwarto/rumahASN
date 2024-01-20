import { adminDashboard } from "@/services/admin.services";
import { useQuery } from "@tanstack/react-query";
import { Card } from "antd";

function PlotVisitors() {
  const { data, isLoading } = useQuery(
    ["analysis-visitors"],
    () => adminDashboard("visitors"),
    {
      refetchOnWindowFocus: false,
    }
  );

  return <div>{data && <Card title="test"></Card>}</div>;
}

export default PlotVisitors;
