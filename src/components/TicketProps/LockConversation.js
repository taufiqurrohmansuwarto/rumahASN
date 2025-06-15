import { lockConversation } from "@/services/index";
import { LockOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, message } from "antd";

const { confirm } = Modal;

function LockConversation({ id }) {
  const queryClient = useQueryClient();

  const { mutateAsync: lock, isLoading } = useMutation(
    (data) => lockConversation(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["publish-ticket", id]);
        message.success("✅ Percakapan berhasil dikunci");
      },
      onError: () => message.error("❌ Percakapan gagal dikunci"),
    }
  );

  const handleSubmit = () => {
    confirm({
      title: "🔒 Kunci Percakapan",
      content:
        "Pengguna tidak akan bisa berkomentar di tiket ini. Anda dapat membuka kembali percakapan kapan saja.",
      onOk: async () => {
        await lock(id);
      },
      width: 600,
      centered: true,
      okText: "✅ Ya, Kunci",
      cancelText: "❌ Batal",
      okButtonProps: {
        style: {
          background: "#fa541c",
          borderColor: "#fa541c",
          fontWeight: 600,
        },
      },
    });
  };

  return (
    <Button
      type="text"
      icon={<LockOutlined />}
      onClick={handleSubmit}
      loading={isLoading}
      block
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        height: "auto",
        padding: "8px 12px",
        color: "#fa541c",
        border: "1px solid #ffd8bf",
        background: "#fff2e8",
        borderRadius: 6,
        fontWeight: 500,
        fontSize: 13,
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#fa541c";
        e.currentTarget.style.color = "white";
        e.currentTarget.style.borderColor = "#fa541c";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#fff2e8";
        e.currentTarget.style.color = "#fa541c";
        e.currentTarget.style.borderColor = "#ffd8bf";
      }}
    >
      🔒 Kunci Percakapan
    </Button>
  );
}

export default LockConversation;
