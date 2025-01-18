import { adminDashboard } from "@/services/admin.services";
import { useQuery } from "@tanstack/react-query";
import { Card } from "antd";
import Bar from "../Plots/Bar";

function QuestionByDepartment() {
  const { data, isLoading } = useQuery(
    ["analysis-top-department-question"],
    () => adminDashboard("top-department-question")
  );

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
    <Card title="Pertanyaan Berdasarkan Perangkat Daerah">
      {data && <Bar {...config} />}
    </Card>
  );
}

export default QuestionByDepartment;
