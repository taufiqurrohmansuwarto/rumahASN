import { useQuery } from "@tanstack/react-query";
import { Button, Card, Col, Row, Skeleton, Statistic } from "antd";
import { toLower } from "lodash";
import { useRouter } from "next/router";
import React from "react";
import { customerDashboard } from "../../services/users.services";

function CustomerDashboard() {
  const { data, isLoading } = useQuery(["dashboard-customer"], () =>
    customerDashboard()
  );
  const router = useRouter();

  const gotoPage = (page) => {
    router.push(`/tickets/${toLower(page)}`);
  };

  return (
    <Skeleton loading={isLoading}>
      <Row gutter={12}>
        {data?.map(({ name, count }) => {
          return (
            <Col key={name} span={6}>
              <Card>
                <Statistic value={count} title={name} />
                <Button
                  onClick={() => gotoPage(name)}
                  style={{ marginTop: 16 }}
                  type="primary"
                >
                  Lihat
                </Button>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Skeleton>
  );
}

export default CustomerDashboard;
