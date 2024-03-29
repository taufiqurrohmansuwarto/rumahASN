import { removeTicket } from "@/services/index";
import { DeleteOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Modal, Row, Space, Typography, message } from "antd";
import { useRouter } from "next/router";

const { confirm } = Modal;

function RemoveTicket({ id }) {
  const router = useRouter();

  const { mutateAsync } = useMutation((data) => removeTicket(data), {
    onSuccess: () => {
      message.success("Tiket berhasil dihapus");
      router.push(`/feeds`);
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
