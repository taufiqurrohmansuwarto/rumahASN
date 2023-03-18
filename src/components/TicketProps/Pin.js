import { pin } from "@/services/index";
import { PushpinOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message, Modal, Row, Space, Typography } from "antd";

const { confirm } = Modal;

function Pin({ id }) {
  const queryClient = useQueryClient();

  const { mutateAsync, isLoading } = useMutation((data) => pin(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["publish-ticket", id]);
      message.success("Tiket berhasil dipin");
    },
    onError: () => message.error("Tiket gagal dipin"),
  });

  const handleSubmit = () => {
    //     mutate(id);
    confirm({
      title: "Apakah Anda yakin ingin mem-pin tiket ini?",
      width: 800,
      centered: true,
      content:
        "Tiket yang sudah dipin akan muncul di halaman utama. Maksimal 3 tiket yang dapat dipin",
      onOk: async () => {
        mutateAsync(id);
      },
    });
  };

  return (
    <Row>
      <Space>
        <PushpinOutlined />
        <Typography.Link style={{ fontSize: 12 }} onClick={handleSubmit}>
          Pin Tiket
        </Typography.Link>
      </Space>
    </Row>
  );
}

export default Pin;
