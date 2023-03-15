import { publishTickets } from "@/services/index";
import { ReadOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Space, Typography } from "antd";

function Publish({ id }) {
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation((data) => publishTickets(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["publish-ticket", id]);
    },
  });

  const handleSubmit = () => {
    mutate(id);
  };

  return (
    <Space onClick={handleSubmit}>
      <ReadOutlined />
      <Typography.Text style={{ fontSize: 12 }}>Publish Ticket</Typography.Text>
    </Space>
  );
}

export default Publish;
