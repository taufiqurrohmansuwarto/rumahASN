import { Table, Checkbox, Typography, Space } from "antd";
import { useState } from "react";
import { useRouter } from "next/router";

const { Text } = Typography;

const mockDataSource = [
  {
    key: 1,
    sender: "Todoist",
    subject: "We noticed a new login to your Todoist account",
    preview: "Wasn't you? Reset your password immediately.",
    date: "10 Sept",
  },
  {
    key: 2,
    sender: "GitHub",
    subject: "[GitHub] Your Dependabot alerts for the week of Sep 3 - Sep 10",
    preview:
      "Explore this week on GitHub GitHub security alert digest taufiqurrohman.suwarto's repository security updates from the we...",
    date: "10 Sept",
  },
  // ... add more mock data items
];

export default function InboxMessages() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const router = useRouter();

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const columns = [
    {
      title: "Sender",
      dataIndex: "sender",
      key: "sender",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text>{text}</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.preview}
          </Text>
        </Space>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      align: "right",
    },
  ];

  const onRow = (record) => {
    return {
      onClick: () => {
        router.push(`/mails/inbox/${record.key}`);
      },
    };
  };

  return (
    <Table
      rowSelection={rowSelection}
      columns={columns}
      dataSource={mockDataSource}
      onRow={onRow}
      pagination={false}
      style={{ cursor: "pointer" }}
    />
  );
}
