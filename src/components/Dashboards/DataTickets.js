import { adminDashboard } from "@/services/admin.services";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row, Skeleton, Statistic } from "antd";
import { sumBy } from "lodash";
import React from "react";

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
    <div style={{ marginBottom: 10 }}>
      <Skeleton loading={isLoading}>
        <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }]}>
          <Col md={6}>
            <Card bordered={false}>
              <Statistic
                title="Total Pertanyaan"
                value={sumBy(data, "count")}
                valueStyle={{
                  color: "#3f8600",
                }}
              />
            </Card>
          </Col>
          <Col md={6}>
            <Card bordered={false}>
              <Statistic
                title="Pertanyaan Diajukan"
                value={questionFilter(data, "DIAJUKAN")?.count}
                valueStyle={{
                  color: "#cf1322",
                }}
              />
            </Card>
          </Col>
          <Col md={6}>
            <Card bordered={false}>
              <Statistic
                title="Pertanyaan Dikerjakan"
                value={questionFilter(data, "DIKERJAKAN")?.count}
                valueStyle={{
                  color: "#cf1322",
                }}
              />
            </Card>
          </Col>
          <Col md={6}>
            <Card bordered={false}>
              <Statistic
                title="Pertanyaan Selesai"
                valueStyle={{
                  color: "#3f8600",
                }}
                value={sumBy(data, "count")}
              />
            </Card>
          </Col>
        </Row>
      </Skeleton>
    </div>
  );
}

export default DataTickets;
