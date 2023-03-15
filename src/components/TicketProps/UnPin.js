import { unpin } from "@/services/index";
import { ExclamationOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Space, Typography, Row, Modal } from "antd";

const { confirm } = Modal;

function UnpinTicket({ id }) {
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation((data) => unpin(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["publish-ticket", id]);
    },
  });

  const handleSubmit = () => {
    confirm({
      title: "Apakah Anda yakin ingin membatalkan pin tiket ini?",
      content:
        "Tiket yang sudah dibatalkan pin tidak akan muncul di halaman utama",
      onOk: () => {
        // mutate(id);
      },
      centered: true,
      width: 800,
    });
  };

  return (
    <Row>
      <Space>
        <ExclamationOutlined />
        <Typography.Link style={{ fontSize: 12 }} onClick={handleSubmit}>
          Pin Tiket
        </Typography.Link>
      </Space>
    </Row>
  );
}

export default UnpinTicket;
