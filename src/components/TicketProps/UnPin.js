import { unpin } from "@/services/index";
import { ExclamationOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Space, Typography, Row, Modal, message } from "antd";

const { confirm } = Modal;

function UnpinTicket({ id }) {
  const queryClient = useQueryClient();

  const { mutateAsync, isLoading } = useMutation((data) => unpin(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["publish-ticket", id]);
      message.success("Tiket berhasil dibatalkan pin");
    },
    onError: () => message.error("Tiket gagal dibatalkan pin"),
  });

  const handleSubmit = () => {
    confirm({
      title: "Apakah Anda yakin ingin membatalkan pin tiket ini?",
      content:
        "Tiket yang sudah dibatalkan pin tidak akan muncul di halaman utama",
      onOk: async () => {
        mutateAsync(id);
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
          Unpin Tiket
        </Typography.Link>
      </Space>
    </Row>
  );
}

export default UnpinTicket;
