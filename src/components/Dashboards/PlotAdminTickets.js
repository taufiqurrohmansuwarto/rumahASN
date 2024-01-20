import Line from "@/components/Plots/Line";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row } from "antd";
import { remove, trim } from "lodash";
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

const serializeVisitors = (data) => {
  const removeSpacingWithRegex = (str) => {
    return str.replace(/\s/g, "");
  };
  return data?.map((d) => {
    return {
      ...d,
      total: parseInt(d.count, 10),
      tanggal: removeSpacingWithRegex(trim(d.tanggal)),
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

  const { data: visitors, isLoading: loadingVisitors } = useQuery(
    ["analysis-visitors"],
    () => adminDashboard("visitors"),
    {
      refetchOnWindowFocus: false,
    }
  );

  const configTotalTiket = {
    data: serialize(dataTicket),
    xField: "bulan",
    yField: "total",
    // smooth: true,
    interactions: [
      {
        type: "marker-active",
      },
    ],
    label: {},
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
        <Col md={24}>
          {visitors && (
            <>
              <Card
                title="Total Pengunjung 30 Hari Terakhir"
                loading={loadingVisitors}
              >
                <Line
                  loading={loadingVisitors}
                  data={serializeVisitors(visitors)}
                  tooltip={{
                    showMarkers: false,
                  }}
                  color={"#09d3ac"}
                  interactions={
                    loadingVisitors
                      ? []
                      : [
                          {
                            type: "marker-active",
                          },
                        ]
                  }
                  point={
                    loadingVisitors
                      ? {}
                      : {
                          size: 5,
                          shape: "diamond",
                          style: {
                            fill: "white",
                            stroke: "#5B8FF9",
                            lineWidth: 2,
                          },
                        }
                  }
                  xField="tanggal"
                  yField="total"
                  padding="auto"
                />
              </Card>
            </>
          )}
        </Col>
      </Row>
    </>
  );
}

export default PlotAdminTickets;
