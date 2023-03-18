import { publishTickets } from "@/services/index";
import { ReadOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Space, Typography, Row, Modal, message } from "antd";
import { useRouter } from "next/router";

const { confirm } = Modal;

function Publish({ id }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutateAsync } = useMutation((data) => publishTickets(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["publish-ticket", id]);
      message.success("Tiket berhasil dipublish");
      router.push("/helpdesk");
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
