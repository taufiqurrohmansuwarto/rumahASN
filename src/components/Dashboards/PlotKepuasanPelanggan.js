import { customerSatisafactionsScore } from "@/services/admin.services";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row } from "antd";
import Line from "@/components/Plots/Line";

const serialize = (data) => {
  return data?.map((item) => ({
    ...item,
    average_ratings: parseFloat(item.average_ratings),
    five_star_ratings: parseFloat(item.five_star_ratings, 10),
    total_ratings: parseFloat(item.total_ratings, 10),
  }));
};

function PlotKepuasanPelanggan() {
  const { data, isLoading } = useQuery(
    ["dashboard-admin", "kepuasanPelanggan"],
    () => customerSatisafactionsScore(),
    {}
  );

  const configAveragetRatings = {
    data: serialize(data),
    xField: "month",
    yField: "average_ratings",
    smooth: true,
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
  };

  const configTotalRatings = {
    data: serialize(data),
    xField: "month",
    yField: "total_ratings",
    smooth: true,
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
  };

  const configFiveStarRatings = {
    data: serialize(data),
    xField: "month",
    yField: "five_star_ratings",
    smooth: true,
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
  };

  return (
    <div>
      {data && (
        <Row gutter={[4, 8]}>
          <Col md={24}>
            <Card title="Rerata Rating 8 bulan terakhir">
              <Line {...configAveragetRatings} loading={isLoading} />
            </Card>
          </Col>
          <Col md={24}>
            <Card title="Total Rating 8 bulan terakhir">
              <Line {...configTotalRatings} loading={isLoading} />
            </Card>
          </Col>
          <Col md={24}>
            <Card title="5 Bintang 8 bulan terakhir">
              <Line {...configFiveStarRatings} loading={isLoading} />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}

export default PlotKepuasanPelanggan;
