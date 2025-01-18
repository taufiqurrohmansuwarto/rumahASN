import CheckUser from "@/components/Documents/CheckUser";
import { Card, Col, Row } from "antd";
import { useSession } from "next-auth/react";

const CurrentUser = () => {
  const { data, status } = useSession();

  return <div>{data?.user?.name}</div>;
};

function Dashboard() {
  return (
    <Row gutter={[16, 16]}>
      <Col md={24} xs={24}>
        <Card>
          <CheckUser />
        </Card>
      </Col>
    </Row>
  );
}

export default Dashboard;
