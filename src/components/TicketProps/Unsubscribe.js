import { BellOutlined } from "@ant-design/icons";
import { Space, Typography, Button } from "antd";

function Unsubscribe() {
  return (
    <Space direction="vertical">
      <Typography.Text style={{ fontSize: 12 }} type="secondary">
        Notifikasi
      </Typography.Text>
      <Button icon={<BellOutlined />}>Berhenti Berlangganan</Button>
      <Typography.Text style={{ fontSize: 12 }}>
        Kamu tidak akan menerima notifikasi jika ada komentar baru
      </Typography.Text>
    </Space>
  );
}

export default Unsubscribe;
