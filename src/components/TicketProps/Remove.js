import { removeTicket } from "@/services/index";
import { DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Row, Space, Typography, Modal } from "antd";

const { confirm } = Modal;

function RemoveTicket({ id }) {
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation((data) => removeTicket(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["publish-ticket", id]);
    },
  });

  const handleSubmit = () => {
    confirm({
      title: "Apakah Anda yakin ingin menghapus tiket ini?",
      content: "Tiket yang sudah dihapus tidak dapat dikembalikan",
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
        <DeleteOutlined />
        <Typography.Link onClick={handleSubmit} style={{ fontSize: 12 }}>
          Hapus
        </Typography.Link>
      </Space>
    </Row>
  );
}

export default RemoveTicket;
