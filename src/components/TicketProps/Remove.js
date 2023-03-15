import { removeTicket } from "@/services/index";
import { DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Space, Typography } from "antd";

function RemoveTicket({ id }) {
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation((data) => removeTicket(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["publish-ticket", id]);
    },
  });

  const handleSubmit = () => {
    mutate(id);
  };

  return (
    <Space onClick={handleSubmit}>
      <DeleteOutlined />
      <Typography.Text style={{ fontSize: 12 }}>Pin Tiket</Typography.Text>
    </Space>
  );
}

export default RemoveTicket;
