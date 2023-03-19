import { unsubscribeTicket } from "@/services/index";
import { IconBellOff } from "@tabler/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, message, Space, Typography } from "antd";

function Unsubscribe({ id }) {
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation((data) => unsubscribeTicket(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["publish-ticket", id]);
    },
    onError: () => message.error("Gagal berlangganan tiket"),
  });

  const handleClick = () => {
    if (isLoading) return;
    mutate(id);
  };

  return (
    <Space direction="vertical">
      <Typography.Text style={{ fontSize: 12 }} type="secondary">
        Notifikasi
      </Typography.Text>
      <Button loading={isLoading} onClick={handleClick}>
        <Space align="start">
          <IconBellOff size={16} />
          Berhenti Berlangganan
        </Space>
      </Button>
      <Typography.Text type="secondary" style={{ fontSize: 10 }}>
        Kamu tidak akan menerima notifikasi jika ada komentar baru
      </Typography.Text>
    </Space>
  );
}

export default Unsubscribe;
