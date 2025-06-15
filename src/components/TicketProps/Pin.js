import { pin } from "@/services/index";
import { PushpinOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message, Modal, Button } from "antd";

const { confirm } = Modal;

function Pin({ id }) {
  const queryClient = useQueryClient();

  const { mutateAsync, isLoading } = useMutation((data) => pin(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["publish-ticket", id]);
      message.success("✅ Tiket berhasil dipin");
    },
    onError: () => message.error("❌ Tiket gagal dipin"),
  });

  const handleSubmit = () => {
    confirm({
      title: "📌 Pin Tiket",
      content:
        "Tiket yang sudah dipin akan muncul di halaman utama. Maksimal 3 tiket yang dapat dipin.",
      onOk: async () => {
        await mutateAsync(id);
      },
      width: 600,
      centered: true,
      okText: "✅ Ya, Pin",
      cancelText: "❌ Batal",
      okButtonProps: {
        style: {
          background: "#1890ff",
          borderColor: "#1890ff",
          fontWeight: 600,
        },
      },
    });
  };

  return (
    <Button
      type="text"
      icon={<PushpinOutlined />}
      onClick={handleSubmit}
      loading={isLoading}
      block
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        height: "auto",
        padding: "8px 12px",
        color: "#1890ff",
        border: "1px solid #bae7ff",
        background: "#e6f7ff",
        borderRadius: 6,
        fontWeight: 500,
        fontSize: 13,
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#1890ff";
        e.currentTarget.style.color = "white";
        e.currentTarget.style.borderColor = "#1890ff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#e6f7ff";
        e.currentTarget.style.color = "#1890ff";
        e.currentTarget.style.borderColor = "#bae7ff";
      }}
    >
      📌 Pin Tiket
    </Button>
  );
}

export default Pin;
