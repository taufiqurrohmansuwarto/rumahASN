import { unpublish } from "@/services/index";
import { CloseSquareOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message, Modal, Button } from "antd";

const { confirm } = Modal;

function Unpublish({ id }) {
  const queryClient = useQueryClient();

  const { mutateAsync, isLoading } = useMutation((data) => unpublish(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["publish-ticket", id]);
      message.success("✅ Tiket berhasil dibatalkan publikasi");
    },
    onError: () => message.error("❌ Tiket gagal dibatalkan publikasi"),
  });

  const handleSubmit = () => {
    confirm({
      title: "🚫 Batal Publikasi Tiket",
      content:
        "Tiket yang dibatalkan publikasinya tidak akan bisa diakses secara publik dan kembali ke agent.",
      onOk: async () => {
        await mutateAsync(id);
      },
      width: 600,
      centered: true,
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
      icon={<CloseSquareOutlined />}
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
      🚫 Batal Publikasi
    </Button>
  );
}

export default Unpublish;
