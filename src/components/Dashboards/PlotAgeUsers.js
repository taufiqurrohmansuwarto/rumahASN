import { adminDashboard } from "@/services/admin.services";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row } from "antd";
import React from "react";
import Column from "@/components/Plots/Column";

function PlotAgeUsers() {
  const { data, isLoading } = useQuery(["analysis-age-users"], () =>
    adminDashboard("group-age")
  );

  const config = {
    data: data?.ages,
    xField: "title",
    yField: "value",
    seriesField: "title",
    label: {
      // 可手动配置 label 数据标签位置
      position: "middle",
      // 'top', 'bottom', 'middle',
      // 配置样式
      style: {
        fill: "#FFFFFF",
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
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
              <Column {...config} />
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
}

export default PlotAgeUsers;
