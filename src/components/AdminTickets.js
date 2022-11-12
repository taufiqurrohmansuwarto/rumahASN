import { useQuery } from "@tanstack/react-query";
import { Tag, Avatar, Card, Divider, Input, Space, Table, Tooltip } from "antd";
import Link from "next/link";
import { useState } from "react";
import { getAllTickets } from "../../services/admin.services";
import { colorTag, formatDate } from "../../utils";

const columns = [
  {
    title: "Oleh",
    key: "oleh",
    render: (_, record) => (
      <Tooltip title={record?.customer?.username}>
        <Avatar src={record?.customer?.image} />
      </Tooltip>
    ),
  },
  { title: "Judul", key: "title", dataIndex: "title" },
  {
    title: "Nomer Tiket",
    key: "ticket_number",
    render: (_, row) => <Tag color="black">{row?.ticket_number}</Tag>,
  },
  {
    title: "Tgl. dibuat",
    key: "created_at",
    render: (_, record) => {
      return formatDate(record.created_at);
    },
  },
  {
    title: "Tgl. update",
    key: "updated_at",
    render: (_, record) => {
      return formatDate(record.updated_at);
    },
  },
  {
    title: "Status",
    key: "status_code",
    render: (_, record) => {
      return (
        <Tag color={colorTag(record?.status_code)}>{record?.status_code}</Tag>
      );
    },
  },
  {
    title: "Aksi",
    key: "aksi",
    render: (_, row) => {
      return (
        <Space>
          <Link href={`/admin/tickets-managements/${row?.id}/detail`}>
            <a>Detail</a>
          </Link>
          <Divider />
        </Space>
      );
    },
  },
];

const AdminTickets = ({ status = "all" }) => {
  const [query, setQuery] = useState({
    page: 1,
    limit: 50,
    status: status,
  });

  const { data, isLoading } = useQuery(
    ["tickets-admins", query],
    () => getAllTickets(query),
    {
      enabled: !!query,
    }
  );

  const handleSearch = (e) => {
    setQuery({
      ...query,
      search: e.target.value,
    });
  };

  return (
    <Card>
      <Table
        title={() => (
          <Input.Search style={{ width: 300 }} onChange={handleSearch} />
        )}
        size="small"
        dataSource={data?.results}
        loading={isLoading}
        rowKey={(row) => row?.id}
        pagination={{
          total: data?.total,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} dari ${total} tiket`,
          current: query.page,
          pageSize: query.limit,
          onChange: (page, limit) => {
            setQuery({
              ...query,
              page,
              limit,
            });
          },
        }}
        columns={columns}
      />
    </Card>
  );
};

export default AdminTickets;
