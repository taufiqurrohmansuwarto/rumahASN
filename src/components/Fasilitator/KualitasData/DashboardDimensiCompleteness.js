import { useQuery } from "@tanstack/react-query";
import { dashboardCompleteness } from "@/services/dimensi-completeness.services";
import { useRouter } from "next/router";
import { Table, Button } from "antd";

function DashboardDimensiCompleteness() {
  const router = useRouter();
  const { data, isLoading } = useQuery(["dashboard-dimensi-completeness"], () =>
    dashboardCompleteness()
  );

  const handleClick = (key) => {
    router.push(`/rekon/anomali/completeness/${key}`);
  };

  const columns = [
    {
      title: "Indikator",
      dataIndex: "label",
    },
    {
      title: "Jumlah",
      dataIndex: "value",
    },
    {
      title: "Aksi",
      render: (_, record) => (
        <Button type="link" onClick={() => handleClick(record.id)}>
          Lihat
        </Button>
      ),
    },
  ];

  return (
    <Table
      style={{
        marginTop: 16,
      }}
      loading={isLoading}
      pagination={false}
      title={() => <h3>Dimensi Completeness</h3>}
      dataSource={data}
      columns={columns}
    />
  );
}

export default DashboardDimensiCompleteness;
