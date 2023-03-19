import { subscribeTicket } from "@/services/index";
import { IconBell } from "@tabler/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, message, Space, Typography } from "antd";

function Subscribe({ id }) {
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation((data) => subscribeTicket(data), {
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
          <IconBell size={16} />
          Berlangganan
        </Space>
      </Button>
      <Typography.Text type="secondary" style={{ fontSize: 10 }}>
        Kamu akan menerima notifikasi jika ada komentar baru
      </Typography.Text>
    </Space>
  );
}

export default Subscribe;
