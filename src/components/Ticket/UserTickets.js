import { getUsersTickets } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

function UserTickets() {
  const router = useRouter();

  const [query, setQuery] = useState({
    id: router?.query?.id,
    query: {
      limit: 10,
      page: 1,
    },
  });

  const { data: tickets, isLoading } = useQuery(
    ["users-tickets", query],
    () => getUsersTickets(query),
    {
      enabled: !!query,
    }
  );

  const columns = [
    {
      title: "Judul Pertanyaan",
      key: "title",
      render: (_, record) => {
        return (
          <Link href={`/customers-tickets/${record?.id}`}>{record?.title}</Link>
        );
      },
    },
    {
      title: "Tgl. Dibuat",
      dataIndex: "created_at",
    },
  ];

  return (
    <div>
      <Table
        pagination={{
          pageSize: query?.query?.limit,
          current: query?.query?.page,
          onChange: (page, pageSize) => {
            setQuery({
              ...query,
              query: {
                ...query?.query,
                page,
              },
            });
          },
        }}
        columns={columns}
        dataSource={tickets?.result}
        rowKey={(row) => row?.id}
      />
    </div>
  );
}

export default UserTickets;