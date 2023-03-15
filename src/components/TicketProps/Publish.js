import { publishTickets } from "@/services/index";
import { ReadOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Space, Typography, Row } from "antd";

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
    <Row>
      <Space onClick={handleSubmit}>
        <ReadOutlined />
        <Typography.Link style={{ fontSize: 12 }}>
          Publish Ticket
        </Typography.Link>
      </Space>
    </Row>
  );
}

export default Publish;
