import { useQuery } from "@tanstack/react-query";
import { Card } from "antd";
import React from "react";
import { customerDashboard } from "../../services/users.services";

function CustomerDashboard() {
  const { data, isLoading } = useQuery(["dashboard-customer"], () =>
    customerDashboard()
  );
  return <Card loading={isLoading}>{JSON.stringify(data)}</Card>;
}

export default CustomerDashboard;
