import { adminDashboard } from "@/services/admin.services";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row, Skeleton, Statistic } from "antd";
import PlotUsers from "./PlotUsers";

function UserByGroup() {
  const { data, isLoading } = useQuery(["analysis-age-users"], () =>
    adminDashboard("group-age")
  );

  return (
    <Skeleton loading={isLoading}>
      <PlotUsers data={data?.groups} />
    </Skeleton>
  );
}

export default UserByGroup;
