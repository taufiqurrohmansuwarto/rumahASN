import { adminDashboard } from "@/services/admin.services";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row, Skeleton, Statistic } from "antd";
import { sumBy } from "lodash";
import React from "react";
import PlotTickets from "./PlotTickets";

const questionFilter = (questions, status) => {
  return questions?.find((question) => question.name === status);
};

function DataTickets() {
  const { data, isLoading } = useQuery(
    ["dashboard-admin"],
    () => adminDashboard(),
    {}
  );

  return (
    <Skeleton loading={isLoading}>
      <PlotTickets data={data} />
    </Skeleton>
  );
}

export default DataTickets;
