import { useQuery } from "@tanstack/react-query";
import { Divider, Space, Table } from "antd";
import Link from "next/link";
import { useState } from "react";
import { getAllTickets } from "../../services/admin.services";

const columns = [
  { title: "Judul", key: "title", dataIndex: "title" },
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

  return (
    <Table
      dataSource={data?.results}
      rowKey={(row) => row?.id}
      pagination={{
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
  );
};

export default AdminTickets;
