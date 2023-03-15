import { unpin } from "@/services/index";
import { ExclamationOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Space, Typography } from "antd";

function UnpinTicket({ id }) {
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation((data) => unpin(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["publish-ticket", id]);
    },
  });

  const handleSubmit = () => {
    mutate(id);
  };

  return (
    <Space onClick={handleSubmit}>
      <ExclamationOutlined />
      <Typography.Text style={{ fontSize: 12 }}>Pin Tiket</Typography.Text>
    </Space>
  );
}

export default UnpinTicket;
