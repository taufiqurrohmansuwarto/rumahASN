import { adminDashboard } from "@/services/admin.services";
import { Bar } from "@ant-design/plots";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row } from "antd";
import React from "react";

function PlotAgeUsers() {
  const { data, isLoading } = useQuery(["analysis-age-users"], () =>
    adminDashboard("group-age")
  );

  const config = {
    data: data?.ages,
    xField: "value",
    yField: "title",
    seriesField: "title",
    label: {
      position: "middle",
    },
    legend: { position: "top-left" },
  };

  return (
    <>
      {data && (
        <Row
          style={{
            marginBottom: 8,
          }}
          gutter={[8, 8]}
        >
          <Col span={24}>
            <Card title="Data Usia Pengguna Pegawai Pemerintah Provinsi Jawa Timur">
              <Bar {...config} />
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
}

export default PlotAgeUsers;
