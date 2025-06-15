import { ticketReminder } from "@/services/index";
import { SendOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal, Button, message } from "antd";

const { confirm } = Modal;

const ReminderTicket = ({ id }) => {
  const queryClient = useQueryClient();
  const { mutateAsync: reminder, isLoading } = useMutation(
    (data) => ticketReminder(data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["publish-ticket", id]);
        message.success("✅ Pengingat berhasil dikirimkan ke customer");
      },
      onError: (err) => {
        message.error("❌ Pengingat gagal dikirimkan ke customer");
      },
    }
  );

  const handleSubmit = () => {
    confirm({
      title: "📧 Kirim Pengingat",
      content:
        "Pengingat akan dikirimkan ke customer melalui email. Pengingat tidak boleh dikirimkan lebih dari 3 kali.",
      onOk: async () => {
        await reminder(id);
      },
      centered: true,
      width: 600,
      okText: "✅ Ya, Kirim",
      cancelText: "❌ Batal",
      okButtonProps: {
        style: {
          background: "#722ed1",
          borderColor: "#722ed1",
          fontWeight: 600,
        },
      },
    });
  };

  return (
    <Button
      type="text"
      icon={<SendOutlined />}
      onClick={handleSubmit}
      loading={isLoading}
      block
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        height: "auto",
        padding: "8px 12px",
        color: "#722ed1",
        border: "1px solid #d3adf7",
        background: "#f9f0ff",
        borderRadius: 6,
        fontWeight: 500,
        fontSize: 13,
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#722ed1";
        e.currentTarget.style.color = "white";
        e.currentTarget.style.borderColor = "#722ed1";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#f9f0ff";
        e.currentTarget.style.color = "#722ed1";
        e.currentTarget.style.borderColor = "#d3adf7";
      }}
    >
      📧 Kirim Pengingat
    </Button>
  );
};

export default ReminderTicket;
