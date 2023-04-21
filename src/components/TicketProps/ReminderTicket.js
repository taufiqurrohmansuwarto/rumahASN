import { ticketReminder } from "@/services/index";
import { SendOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal, Row, Space, Typography, message } from "antd";

const { confirm } = Modal;

const ReminderTicket = ({ id }) => {
  const queryClient = useQueryClient();
  const { mutateAsync: reminder } = useMutation(
    (data) => ticketReminder(data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["publish-ticket", id]);
        message.success("Pengingat berhasil dikirimkan ke customer");
      },
      onError: (err) => {
        message.error("Pengingat gagal dikirimkan ke customer");
      },
    }
  );

  const handleSubmit = () => {
    confirm({
      title: "Apakah Anda yakin ingin mengirimkan pengingat ke customer?",
      content:
        "Pengingat akan dikirimkan ke customer melalui email. Pengingat tidak boleh dikirimkan lebih dari 3 kali",
      onOk: async () => {
        await reminder(id);
      },
      centered: true,
      width: 800,
    });
  };

  return (
    <Row>
      <Space onClick={handleSubmit}>
        <SendOutlined />
        <Typography.Link
          style={{
            fontSize: 12,
          }}
        >
          Kirim Pengingat
        </Typography.Link>
      </Space>
    </Row>
  );
};

export default ReminderTicket;
