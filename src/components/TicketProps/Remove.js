import { removeTicket } from "@/services/index";
import { DeleteOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Modal, Button, message } from "antd";
import { useRouter } from "next/router";

const { confirm } = Modal;

function RemoveTicket({ id }) {
  const router = useRouter();

  const { mutateAsync, isLoading } = useMutation((data) => removeTicket(data), {
    onSuccess: () => {
      message.success("✅ Tiket berhasil dihapus");
      router.push(`/feeds`);
    },
    onError: () => message.error("❌ Tiket gagal dihapus"),
  });

  const handleSubmit = () => {
    confirm({
      title: "🗑️ Hapus Tiket",
      content:
        "Tiket yang sudah dihapus tidak dapat dikembalikan. Apakah Anda yakin?",
      onOk: async () => {
        await mutateAsync(id);
      },
      centered: true,
      width: 600,
      okText: "✅ Ya, Hapus",
      cancelText: "❌ Batal",
      okType: "danger",
      okButtonProps: {
        style: {
          background: "#ff4d4f",
          borderColor: "#ff4d4f",
          fontWeight: 600,
        },
      },
    });
  };

  return (
    <Button
      type="text"
      icon={<DeleteOutlined />}
      onClick={handleSubmit}
      loading={isLoading}
      block
      danger
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        height: "auto",
        padding: "8px 12px",
        color: "#ff4d4f",
        border: "1px solid #ffccc7",
        background: "#fff2f0",
        borderRadius: 6,
        fontWeight: 500,
        fontSize: 13,
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#ff4d4f";
        e.currentTarget.style.color = "white";
        e.currentTarget.style.borderColor = "#ff4d4f";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#fff2f0";
        e.currentTarget.style.color = "#ff4d4f";
        e.currentTarget.style.borderColor = "#ffccc7";
      }}
    >
      🗑️ Hapus Tiket
    </Button>
  );
}

export default RemoveTicket;
