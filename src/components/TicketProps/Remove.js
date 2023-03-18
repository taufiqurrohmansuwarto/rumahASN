import { removeTicket } from "@/services/index";
import { DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Row, Space, Typography, Modal, message } from "antd";

const { confirm } = Modal;

function RemoveTicket({ id }) {
  const queryClient = useQueryClient();

  const { mutateAsync, isLoading } = useMutation((data) => removeTicket(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["publish-ticket", id]);
      message.success("Tiket berhasil dihapus");
    },
    onError: () => message.error("Tiket gagal dihapus"),
  });

  const handleSubmit = () => {
    confirm({
      title: "Apakah Anda yakin ingin menghapus tiket ini?",
      content: "Tiket yang sudah dihapus tidak dapat dikembalikan",
      onOk: async () => {
        await mutateAsync(id);
      },
      centered: true,
      width: 800,
    });
  };

  return (
    <Row>
      <Space>
        <DeleteOutlined />
        <Typography.Link onClick={handleSubmit} style={{ fontSize: 12 }}>
          Hapus
        </Typography.Link>
      </Space>
    </Row>
  );
}

export default RemoveTicket;
