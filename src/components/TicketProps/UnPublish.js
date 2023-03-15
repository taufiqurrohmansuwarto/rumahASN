import { unpublish } from "@/services/index";
import { LockOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Space, Typography } from "antd";

function Unpublish({ id }) {
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation((data) => unpublish(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["publish-ticket", id]);
    },
  });

  const handleSubmit = () => {
    mutate(id);
  };

  return (
    <Space onClick={handleSubmit}>
      <LockOutlined />
      <Typography.Text style={{ fontSize: 12 }}>
        Unpublish Ticket
      </Typography.Text>
    </Space>
  );
}

export default Unpublish;
