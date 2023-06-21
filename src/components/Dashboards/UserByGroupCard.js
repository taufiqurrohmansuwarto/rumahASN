import { adminDashboard } from "@/services/admin.services";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row, Skeleton, Statistic } from "antd";

function UserByGroup() {
  const { data, isLoading } = useQuery(["analysis-age-users"], () =>
    adminDashboard("group-age")
  );

  return (
    <div style={{ marginBottom: 10 }}>
      <Skeleton loading={isLoading}>
        <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }]}>
          {data?.groups?.map((group) => (
            <Col md={8} key={group?.title}>
              <Card bordered={false}>
                <Statistic title={group?.title} value={group?.value} />
              </Card>
            </Col>
          ))}
        </Row>
      </Skeleton>
    </div>
  );
}

export default UserByGroup;
