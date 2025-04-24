import { useQuery } from "@tanstack/react-query";
import { dashboardAccuracy } from "@/services/dimensi-accuracy.services";
import { useRouter } from "next/router";
import { Table, Button } from "antd";

function DashboardDimensiAccuracy() {
  const router = useRouter();
  const { data, isLoading } = useQuery(["dashboard-dimensi-accuracy"], () =>
    dashboardAccuracy()
  );

  const handleClick = (key) => {
    router.push(`/rekon/anomali/accuracy/${key}`);
  };

  const columns = [
    {
      title: "Indikator",
      dataIndex: "label",
    },
    {
      title: "Total Pegawai",
      dataIndex: "total_pegawai",
    },
    {
      title: "Data Bermasalah",
      dataIndex: "value",
    },
    {
      title: "Bobot Indikator",
      dataIndex: "bobot",
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
    <>
      <Table
        style={{
          marginTop: 16,
        }}
        loading={isLoading}
        pagination={false}
        title={() => <h3>Dimensi Accuracy</h3>}
        dataSource={data}
        columns={columns}
      />
    </>
  );
}

export default DashboardDimensiAccuracy;
