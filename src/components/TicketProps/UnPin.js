import { unpin } from "@/services/index";
import { ExclamationOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, message } from "antd";

const { confirm } = Modal;

function UnpinTicket({ id }) {
  const queryClient = useQueryClient();

  const { mutateAsync, isLoading } = useMutation((data) => unpin(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["publish-ticket", id]);
      message.success("✅ Tiket berhasil dibatalkan pin");
    },
    onError: () => message.error("❌ Tiket gagal dibatalkan pin"),
  });

  const handleSubmit = () => {
    confirm({
      title: "📌 Batalkan Pin Tiket",
      content: "Tiket yang dibatalkan pin tidak akan muncul di halaman utama.",
      onOk: async () => {
        await mutateAsync(id);
      },
      centered: true,
      width: 600,
      okText: "✅ Ya, Batalkan",
      cancelText: "❌ Batal",
      okButtonProps: {
        style: {
          background: "#fa8c16",
          borderColor: "#fa8c16",
          fontWeight: 600,
        },
      },
    });
  };

  return (
    <Button
      type="text"
      icon={<ExclamationOutlined />}
      onClick={handleSubmit}
      loading={isLoading}
      block
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        height: "auto",
        padding: "8px 12px",
        color: "#fa8c16",
        border: "1px solid #ffe7ba",
        background: "#fff7e6",
        borderRadius: 6,
        fontWeight: 500,
        fontSize: 13,
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#fa8c16";
        e.currentTarget.style.color = "white";
        e.currentTarget.style.borderColor = "#fa8c16";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#fff7e6";
        e.currentTarget.style.color = "#fa8c16";
        e.currentTarget.style.borderColor = "#ffe7ba";
      }}
    >
      📌 Batalkan Pin
    </Button>
  );
}

export default UnpinTicket;
