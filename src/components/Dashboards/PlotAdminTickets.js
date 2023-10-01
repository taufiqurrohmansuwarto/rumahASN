import { Line } from "@ant-design/plots";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row } from "antd";
import React from "react";
import {
  adminDashboard,
  ticketStatisticsScore,
} from "../../../services/admin.services";

const serialize = (data) => {
  return data?.map((d) => {
    return {
      ...d,
      diajukan: parseInt(d.diajukan, 10),
      dikerjakan: parseInt(d.dikerjakan, 10),
      selesai: parseInt(d.selesai, 10),
      total: parseInt(d.total, 10),
    };
  });
};

function PlotAdminTickets() {
  const { data, isLoading } = useQuery(["dashboard-admin", "last7Days"], () =>
    adminDashboard("last7Days")
  );

  const { data: dataTicket, isLoading: loadingTicket } = useQuery(
    ["dashboard-admin", "ticketStatistics"],
    () => ticketStatisticsScore()
  );

  const configTotalTiket = {
    data: serialize(dataTicket),
    xField: "bulan",
    yField: "total",
    // smooth: true,
    point: {
      size: 5,
      shape: "diamond",
      style: {
        fill: "white",
        stroke: "#5B8FF9",
        lineWidth: 2,
      },
    },
    tooltip: {
      showMarkers: false,
    },
    color: "#09d3ac",
  };

  return (
    <>
      <Row gutter={[8, 8]}>
        <Col md={24}>
          <Card title="Total pertanyaan 7 hari terakhir" loading={isLoading}>
            {data && (
              <Line
                loading={isLoading}
                data={data}
                xField="date"
                yField="count"
                padding="auto"
              />
            )}
          </Card>
        </Col>
        <Col md={24}>
          {dataTicket && (
            <Card title="Total Tiket 12 Bulan Terakhir" loading={loadingTicket}>
              <Line {...configTotalTiket} />
            </Card>
          )}
        </Col>
      </Row>
    </>
  );
}

export default PlotAdminTickets;
