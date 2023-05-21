import { agentsPerformances } from "@/services/admin.services";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Rate, Space, Table } from "antd";

function PlotAgentPerformances() {
  const { data, isLoading } = useQuery(
    ["analysis-performa-agent"],
    () => agentsPerformances(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const columns = [
    {
      title: "No",
      key: "nomer",
      render: (text, record, index) => index + 1,
      width: 50,
    },
    {
      title: "Nama",
      key: "agent_username",
      render: (_, record) => (
        <Space>
          <Avatar src={record?.agent_image} shape="square" />
          {record?.agent_username}
        </Space>
      ),
    },
    {
      title: "Rating",
      key: "average_rating",
      render: (_, record) => (
        <Rate allowHalf value={record?.avg_satisfaction_rating} disabled />
      ),
    },
    { title: "Pertanyaan ditangani", dataIndex: "total_tickets_handled" },
    {
      title: "Pertanyaan dikerjakan",
      dataIndex: "total_tickets_handled_in_progress",
    },
    {
      title: "Pertanyaan diselesaikan",
      dataIndex: "total_tickets_handled_done",
    },
    { title: "Rerata waktu response", dataIndex: "avg_response_time_minutes" },
  ];

  return (
    <div>
      <Table
        columns={columns}
        rowKey={(row) => row?.agent_id}
        dataSource={data}
        loading={isLoading}
        pagination={false}
      />
    </div>
  );
}

export default PlotAgentPerformances;
