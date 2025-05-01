import DataTickets from "@/components/Dashboards/DataTickets";
import PlotAdminTickets from "@/components/Dashboards/PlotAdminTickets";
import PlotAgeUsers from "@/components/Dashboards/PlotAgeUsers";
import QuestionByDepartment from "@/components/Dashboards/QuestionByDepartment";
import UserByDepartment from "@/components/Dashboards/UserByDepartment";
import UserByGroup from "@/components/Dashboards/UserByGroupCard";
import { cekTotalPenggunaBestie } from "@/services/assistant-ai.services";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Flex,
  Rate,
  Row,
  Spin,
  Table,
  Typography,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";

const TotalPenggunaBestie = () => {
  const columns = [
    {
      title: "Nama",
      key: "name",
      render: (_, record) => {
        return <Typography.Text>{record?.user?.username}</Typography.Text>;
      },
    },
    {
      title: "Rating",
      key: "rating",
      render: (_, record) => {
        return <Rate disabled value={record?.rating} />;
      },
    },
    {
      title: "Feedback",
      key: "feedback",
      dataIndex: "feedback",
    },
  ];

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["total-pengguna-bestie"],
    queryFn: cekTotalPenggunaBestie,
    refetchOnWindowFocus: false,
  });

  return (
    <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
      <Col md={12} xs={24}>
        <Card title="Pengguna BestieAI">
          <Spin spinning={isLoading} fullscreen />

          <Table
            title={() => {
              return (
                <Flex justify="space-between">
                  <Typography.Text>
                    Daftar Pengguna BestieAI ({data?.total})
                  </Typography.Text>
                  <Button
                    type="text"
                    onClick={() => refetch()}
                    icon={<ReloadOutlined />}
                  />
                </Flex>
              );
            }}
            size="small"
            loading={isFetching || isLoading}
            dataSource={data?.feedback}
            pagination={{
              pageSize: 25,
              total: data?.feedback?.length,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total}`,
            }}
            columns={columns}
            rowKey="id"
          />
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
