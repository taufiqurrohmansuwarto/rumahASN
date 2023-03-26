import { publish } from "@/services/index";
import { ReadOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message, Modal, Row, Space, Typography } from "antd";

const { confirm } = Modal;

function Publish({ id }) {
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation((data) => publish(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["publish-ticket", id]);
      message.success("Tiket berhasil dipublish");
    },
    onError: () => message.error("Tiket gagal dipublish"),
  });

  const handleSubmit = () => {
    confirm({
      title: "Apakah Anda yakin ingin mempublish tiket ini?",
      content:
        "Tiket yang sudah dipublish akan muncul di halaman utama, dan semua user dapat melihat tiket ini",
      onOk: async () => {
        await mutateAsync(id);
      },
      centered: true,
      width: 800,
    });
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
