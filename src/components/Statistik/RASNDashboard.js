import DataTickets from "@/components/Dashboards/DataTickets";
import PlotAdminTickets from "@/components/Dashboards/PlotAdminTickets";
import PlotAgeUsers from "@/components/Dashboards/PlotAgeUsers";
import QuestionByDepartment from "@/components/Dashboards/QuestionByDepartment";
import UserByDepartment from "@/components/Dashboards/UserByDepartment";
import UserByGroup from "@/components/Dashboards/UserByGroupCard";
import { cekTotalPenggunaBestie } from "@/services/assistant-ai.services";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row, Spin } from "antd";

const TotalPenggunaBestie = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["total-pengguna-bestie"],
    queryFn: cekTotalPenggunaBestie,
    refetchOnWindowFocus: false,
  });

  return (
    <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
      <Col md={12} xs={24}>
        <Card title="Pengguna BestieAI">
          <Spin spinning={isLoading} fullscreen />

          <p>{data?.total}</p>
          {JSON.stringify(data?.feedback)}
        </Card>
      </Col>
    </Row>
  );
};

function RASNDashboard() {
  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col md={12} xs={24}>
          <Card title="Statistik Pertanyaan">
            <DataTickets />
          </Card>
        </Col>
        <Col md={12} xs={24}>
          <Card title="Statistik Pengguna">
            <UserByGroup />
          </Card>
        </Col>

        <Col md={24} xs={24}>
          <UserByDepartment />
        </Col>
        <Col md={24} xs={24}>
          <QuestionByDepartment />
        </Col>
      </Row>
      <PlotAgeUsers />
      <PlotAdminTickets />
      <TotalPenggunaBestie />
    </>
  );
}

export default RASNDashboard;
