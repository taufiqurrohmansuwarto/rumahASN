import { Empty, Button, Space, Typography } from "antd";
import {
  FileTextOutlined,
  PlusOutlined,
  InboxOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export const EmptyDocuments = ({ onCreateNew }) => (
  <Empty
    image={<FileTextOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />}
    imageStyle={{ height: 100 }}
    description={
      <Space direction="vertical">
        <Text>Belum ada dokumen</Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Mulai dengan mengupload dokumen pertama Anda
        </Text>
      </Space>
    }
  >
    {onCreateNew && (
      <Button type="primary" icon={<PlusOutlined />} onClick={onCreateNew}>
        Upload Dokumen
      </Button>
    )}
  </Empty>
);

export const EmptySignatureRequests = () => (
  <Empty
    image={<InboxOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />}
    imageStyle={{ height: 100 }}
    description={
      <Space direction="vertical">
        <Text>Tidak ada permintaan tanda tangan</Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Permintaan tanda tangan akan muncul di sini
        </Text>
      </Space>
    }
  />
);

export const EmptyBsreTransactions = () => (
  <Empty
    image={<InboxOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />}
    imageStyle={{ height: 100 }}
    description={
      <Space direction="vertical">
        <Text>Belum ada transaksi BSrE</Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Transaksi BSrE akan muncul setelah proses tanda tangan
        </Text>
      </Space>
    }
  />
);

export const EmptySearch = ({ searchTerm }) => (
  <Empty
    description={
      <Space direction="vertical">
        <Text>Tidak ditemukan hasil untuk "{searchTerm}"</Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Coba gunakan kata kunci yang berbeda
        </Text>
      </Space>
    }
  />
);