import { useQuery } from "@tanstack/react-query";
import { dashboardConsistency } from "@/services/dimensi-consistency.services";
import { useRouter } from "next/router";
import { Table, Button } from "antd";

function DashboardDimensiConsistency() {
  const router = useRouter();
  const { data, isLoading } = useQuery(["dashboard-dimensi-consistency"], () =>
    dashboardConsistency()
  );

  const handleClick = (key) => {
    router.push(`/rekon/anomali/consistency/${key}`);
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
        title={() => <h3>Dimensi Consistency</h3>}
        dataSource={data}
        columns={columns}
      />
    </>
  );
}

export default DashboardDimensiConsistency;
