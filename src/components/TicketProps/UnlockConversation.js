import { unlockConversation } from "@/services/index";
import { UnlockOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, message } from "antd";

const { confirm } = Modal;

function UnlockConversation({ id }) {
  const queryClient = useQueryClient();

  const { mutateAsync, isLoading } = useMutation(
    (data) => unlockConversation(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["publish-ticket", id]);
        message.success("✅ Percakapan berhasil dibuka kembali");
      },
      onError: () => message.error("❌ Percakapan gagal dibuka kembali"),
    }
  );

  const handleSubmit = () => {
    confirm({
      title: "🔓 Buka Percakapan",
      content:
        "Percakapan yang sudah dibuka kembali dapat diakses dan dikomentari oleh pelanggan.",
      onOk: async () => {
        await mutateAsync(id);
      },
      centered: true,
      width: 600,
      okText: "✅ Ya, Buka",
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
      icon={<UnlockOutlined />}
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
      🔓 Buka Percakapan
    </Button>
  );
}

export default UnlockConversation;
