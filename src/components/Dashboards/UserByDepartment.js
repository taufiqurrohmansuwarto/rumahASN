import { adminDashboard } from "@/services/admin.services";
import { useQuery } from "@tanstack/react-query";
import { Card, Table } from "antd";
import Bar from "../Plots/Bar";

function UserByDepartment() {
  const { data, isLoading } = useQuery(["analysis-user-by-department"], () =>
    adminDashboard("departments")
  );
  const columns = [
    {
      title: "Departemen",
      dataIndex: "perangkat_daerah",
      key: "perangkat_daerah",
    },
  ];

  const config = {
    data: data,
    xField: "total",
    yField: "perangkat_daerah",
    seriesField: "perangkat_daerah",
    label: {
      position: "middle",
    },
    legend: { position: "top-left" },
  };

  return (
    <Card title="Pengguna Berdasarkan Perangkat Daerah">
      {data && <Bar {...config} />}
    </Card>
  );
}

export default UserByDepartment;
