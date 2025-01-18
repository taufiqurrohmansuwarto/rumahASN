import { adminDashboard } from "@/services/admin.services";
import { useQuery } from "@tanstack/react-query";
import { Card } from "antd";

function QuestionByDepartment() {
  const { data, isLoading } = useQuery(
    ["analysis-top-department-question"],
    () => adminDashboard("top-department-question")
  );

  return (
    <Card title="Pertanyaan Berdasarkan Perangkat Daerah">
      {JSON.stringify(data)}
    </Card>
  );
}

export default QuestionByDepartment;
