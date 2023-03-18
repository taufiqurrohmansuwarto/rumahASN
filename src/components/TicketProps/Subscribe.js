import { BellOutlined } from "@ant-design/icons";
import { Space, Typography, Button } from "antd";

function Subscribe() {
  return (
    <Space direction="vertical">
      <Typography.Text style={{ fontSize: 12 }} type="secondary">
        Notifikasi
      </Typography.Text>
      <Button icon={<BellOutlined />}>Berlangganan</Button>
      <Typography.Text style={{ fontSize: 12 }}>
        Kamu akan menerima notifikasi jika ada komentar baru
      </Typography.Text>
    </Space>
  );
}

export default Subscribe;
