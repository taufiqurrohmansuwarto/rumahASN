import { publish } from "@/services/index";
import { ReadOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message, Modal, Button } from "antd";

const { confirm } = Modal;

function Publish({ id }) {
  const queryClient = useQueryClient();

  const { mutateAsync, isLoading } = useMutation((data) => publish(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["publish-ticket", id]);
      message.success("✅ Tiket berhasil dipublish");
    },
    onError: () => message.error("❌ Tiket gagal dipublish"),
  });

  const handleSubmit = () => {
    confirm({
      title: "📢 Publish Tiket",
      content:
        "Tiket yang sudah dipublish akan muncul di halaman utama dan dapat dilihat oleh semua user. Pastikan tidak ada informasi pribadi sebelum mempublish.",
      onOk: async () => {
        await mutateAsync(id);
      },
      centered: true,
      width: 600,
      okText: "✅ Ya, Publish",
      cancelText: "❌ Batal",
      okButtonProps: {
        style: {
          background: "#52c41a",
          borderColor: "#52c41a",
          fontWeight: 600,
        },
      },
    });
  };

  return (
    <Button
      type="text"
      icon={<ReadOutlined />}
      onClick={handleSubmit}
      loading={isLoading}
      block
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        height: "auto",
        padding: "8px 12px",
        color: "#52c41a",
        border: "1px solid #d9f7be",
        background: "#f6ffed",
        borderRadius: 6,
        fontWeight: 500,
        fontSize: 13,
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#52c41a";
        e.currentTarget.style.color = "white";
        e.currentTarget.style.borderColor = "#52c41a";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#f6ffed";
        e.currentTarget.style.color = "#52c41a";
        e.currentTarget.style.borderColor = "#d9f7be";
      }}
    >
      📢 Publish Tiket
    </Button>
  );
}

export default Publish;
