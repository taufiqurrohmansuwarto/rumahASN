import { unpublish } from "@/services/index";
import { CloseSquareOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message, Modal, Row, Space, Typography } from "antd";

const { confirm } = Modal;

function Unpublish({ id }) {
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation((data) => unpublish(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["publish-ticket", id]);
      message.success("Tiket berhasil dibatalkan publikasi");
    },
    onError: () => message.error("Tiket gagal dibatalkan publikasi"),
  });

  const handleSubmit = () => {
    confirm({
      onOk: async () => {
        await mutateAsync(id);
      },
      width: 800,
      centered: true,
      title: "Batal Publikasi Tiket",
      content:
        "Apakah anda yakin ingin membatalkan publikasi tiket ini?. Tiket yang dibatalkan tidak akan bisa diakses secara publik oleh pengguna dan kembali ke agent.",
    });
  };

  return (
    <Row>
      <Space>
        <CloseSquareOutlined />
        <Typography.Link style={{ fontSize: 12 }} onClick={handleSubmit}>
          Batal Publikasi Tiket
        </Typography.Link>
      </Space>
    </Row>
  );
}

export default Unpublish;
