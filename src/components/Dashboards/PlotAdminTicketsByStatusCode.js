import { Line } from "@ant-design/plots";
import { useQuery } from "@tanstack/react-query";
import { Card } from "antd";
import React from "react";
import { adminDashboard } from "../../../services/admin.services";

function PlotAdminTicketsByStatusCode() {
  const { data, isLoading } = useQuery(
    ["dashboard-admin", "last7DaysAll"],
    () => adminDashboard("last7DaysAll")
  );

  return (
    <>
      <Card title="Total tiket 7 hari terakhir" loading={isLoading}>
        <Line
          data={data}
          xField="date"
          seriesField="status_code"
          yField="count"
          padding="auto"
        />
      </Card>
    </>
  );
}

export default PlotAdminTicketsByStatusCode;
