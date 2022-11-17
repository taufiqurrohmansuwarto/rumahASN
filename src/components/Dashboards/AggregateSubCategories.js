import { useQuery } from "@tanstack/react-query";
import { Card } from "antd";
import React from "react";
import { adminDashboard } from "../../../services/admin.services";

function AggregateSubCategories() {
  const { data, isLoading } = useQuery(
    ["dashboard-admin", "aggregateSubCategories"],
    () => adminDashboard("aggregateSubCategories")
  );

  return <Card loading={isLoading}>{JSON.stringify(data)}</Card>;
}

export default AggregateSubCategories;
